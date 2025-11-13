import { google } from 'googleapis';
import path from 'path';

const SERVICE_ACCOUNT_KEY_PATH = path.join(process.cwd(), 'drive-api-476418-fcf4c9d411f6.json');


function getDriveClient() {
    const auth = new google.auth.GoogleAuth({
        keyFile: SERVICE_ACCOUNT_KEY_PATH,
        scopes: ['https://www.googleapis.com/auth/drive'],
    });

    return google.drive({ version: 'v3', auth });
}

export const extractFileIdFromDriveUrl = (driveUrl: string): string | null => {
    try {
        // Pattern 1: /file/d/FILE_ID/
        const pattern1 = /\/file\/d\/([a-zA-Z0-9_-]+)/;
        const match1 = driveUrl.match(pattern1);
        if (match1) {
            return match1[1];
        }

        // Pattern 2: ?id=FILE_ID
        const pattern2 = /[?&]id=([a-zA-Z0-9_-]+)/;
        const match2 = driveUrl.match(pattern2);
        if (match2) {
            return match2[1];
        }

        return null;
    } catch (error) {
        console.error('Error extracting file ID from Drive URL:', error);
        return null;
    }
};

export const addUserAccessToFile = async (fileId: string, email: string) => {
    try {
        const permission = await addUserEmailToDriveRestricted(email, fileId);
        
        console.log(`✓ Successfully granted access to ${email} for file "${fileId}"`);
        
        return {
            fileId: fileId,
            permission: permission
        };
        
    } catch (error: any) {
        console.error('Error adding user access to file:', error.message);
        throw new Error(`Failed to add user access to file: ${error.message}`);
    }
};

export const getFileFromFolderAndAddUserAccess = async (folderId: string, email: string, fileName: string) => {
    try {
        const files = await getAllFilesInAFolder(folderId);
        
        const file = files.find(f => f.name === fileName);
        
        if (!file) {
            throw new Error(`File "${fileName}" not found in folder ${folderId}`);
        }
        
        const permission = await addUserEmailToDriveRestricted(email, file.id!);
        
        console.log(`✓ Successfully granted access to ${email} for file "${fileName}"`);
        
        return {
            fileId: file.id,
            fileName: file.name,
            permission: permission
        };
        
    } catch (error: any) {
        console.error('Error getting file from folder and adding user access:', error.message);
        throw new Error(`Failed to get file from folder and adding user access: ${error.message}`);
    }
};

export const addUserEmailToDriveRestricted = async (
    email: string,
    fileId: string
) => {
    const drive = getDriveClient();

    // try {
    //     // First, restrict file sharing settings
    //     await drive.files.update({
    //         fileId: fileId,
    //         requestBody: {
    //             copyRequiresWriterPermission: true,
    //             writersCanShare: false
    //         }
    //     });

    //     console.log(`✓ File restrictions updated for ${fileId}`);
    // } catch (error: any) {
    //     console.error('Warning: Could not update file restrictions:', error.message);
      
    // }

    try {
        const permissionResponse = await drive.permissions.create({
            fileId: fileId,
            requestBody: {
                type: 'user',
                role: 'reader',
                emailAddress: email
            },
            sendNotificationEmail: false, // We send our own custom email
            fields: 'id,emailAddress,role'
        });

        console.log(`✓ Access granted to ${email}`);
        return permissionResponse.data;

    } catch (error: any) {
        console.error('Error granting access:', error.message);
        throw new Error(`Failed to grant access to ${email}: ${error.message}`);
    }
};

export const getFileInfo = async (fileId: string) => {
    try {
        const drive = getDriveClient();
        const response = await drive.files.get({
            fileId: fileId,
            fields: 'id,name,mimeType,webViewLink,webContentLink,size'
        });
        return response.data;
    } catch (error: any) {
        console.error('Error getting file info:', error.message);
        throw new Error(`Failed to get file info: ${error.message}`);
    }
};

export const removeUserAccess = async (fileId: string, email: string) => {
    try {
        const drive = getDriveClient();

        const permissions = await drive.permissions.list({
            fileId: fileId,
            fields: 'permissions(id,emailAddress)'
        });

        const permission = permissions.data.permissions?.find(
            p => p.emailAddress === email
        );

        if (permission?.id) {
            await drive.permissions.delete({
                fileId: fileId,
                permissionId: permission.id
            });
            console.log(`✓ Access removed for ${email}`);
            return true;
        }

        console.log(`⚠️  No permission found for ${email}`);
        return false;
    } catch (error: any) {
        console.error('Error removing access:', error.message);
        throw new Error(`Failed to remove access for ${email}: ${error.message}`);
    }
};

export const listFilePermissions = async (fileId: string) => {
    try {
        const drive = getDriveClient();
        const permissions = await drive.permissions.list({
            fileId: fileId,
            fields: 'permissions(id,emailAddress,role,type)'
        });
        return permissions.data.permissions || [];
    } catch (error: any) {
        console.error('Error listing permissions:', error.message);
        throw new Error(`Failed to list permissions: ${error.message}`);
    }
};

export const checkUserAccess = async (fileId: string, email: string) => {
    try {
        const permissions = await listFilePermissions(fileId);
        return permissions.some(p => p.emailAddress === email);
    } catch (error: any) {
        console.error('Error checking user access:', error.message);
        return false;
    }
};

export const getAllFilesInAFolder = async (folderId: string) => {
    try {
        const drive = getDriveClient();
        const response = await drive.files.list({
            q: `'${folderId}' in parents`,
            fields: 'files(id,name,mimeType,webViewLink,webContentLink,size)'
        });
        return response.data.files || [];
    } catch (error: any) {
        console.error('Error getting all files in a folder:', error.message);
        throw new Error(`Failed to get all files in a folder: ${error.message}`);
    }
};

