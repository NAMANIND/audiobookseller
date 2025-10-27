// test-drive.ts
import { 
    addUserEmailToDriveRestricted, 
    getFileInfo, 
    listFilePermissions,
    checkUserAccess 
} from './src/lib/drive';

async function testFullFlow() {
    const fileId = '1oArN5Fv-ba463PkvAatZTIVYNCYC90OZ';
    const testEmail = 'adarshjaiswal9472@gmail.com';

    console.log('=== AUDIOBOOK PURCHASE FLOW TEST ===\n');

    try {
        // Step 1: Get file info
        console.log('Step 1: Getting file information...');
        const fileInfo = await getFileInfo(fileId);
        console.log(`✓ File: ${fileInfo.name}`);
        console.log(`  Type: ${fileInfo.mimeType}`);
        console.log(`  Size: ${fileInfo.size ? (parseInt(fileInfo.size) / 1024 / 1024).toFixed(2) + ' MB' : 'Unknown'}`);

        // Step 2: Check if user already has access
        console.log(`\nStep 2: Checking if ${testEmail} already has access...`);
        const hasAccess = await checkUserAccess(fileId, testEmail);
        if (hasAccess) {
            console.log('⚠️  User already has access!');
        } else {
            console.log('✓ User does not have access yet');
        }

        // Step 3: Grant access
        console.log(`\nStep 3: Granting access to ${testEmail}...`);
        const result = await addUserEmailToDriveRestricted(testEmail, fileId);
        console.log('✓ Permission created:', {
            id: result.id,
            email: result.emailAddress,
            role: result.role
        });

        // Step 4: List all permissions
        console.log('\nStep 4: Listing all file permissions...');
        const allPermissions = await listFilePermissions(fileId);
        console.log(`✓ Total permissions: ${allPermissions.length}`);
        allPermissions.forEach((p, i) => {
            console.log(`  ${i + 1}. ${p.emailAddress || p.type}: ${p.role}`);
        });

        // Step 5: Generate shareable link
        console.log('\nStep 5: Generating download link...');
        const downloadLink = `https://drive.google.com/file/d/${fileId}/view`;
        console.log(`✓ Download link: ${downloadLink}`);

        console.log('\n=== TEST COMPLETED SUCCESSFULLY ===');
        console.log(`\n📧 ${testEmail} should receive an email notification with access to the file.`);

    } catch (error) {
        console.error('\n❌ TEST FAILED:', error);
    }
}

testFullFlow();