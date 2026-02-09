const fetch = require('node-fetch');

const API_URL = 'http://localhost:5000/api';

async function createAdminUser() {
    try {
        console.log('🔄 Creating admin user...\n');

        // First, get all roles to find the ADMIN role ID
        const rolesResponse = await fetch(`${API_URL}/user-roles`);
        const roles = await rolesResponse.json();

        const adminRole = roles.find(role => role.role === 'ADMIN');

        if (!adminRole) {
            console.error('❌ ADMIN role not found in database!');
            console.log('Please make sure the backend has seeded the roles.');
            return;
        }

        console.log(`✅ Found ADMIN role with ID: ${adminRole.id}\n`);

        // Create the admin user
        const userData = {
            fullName: 'JS Mart Administrator',
            emailAddress: 'admin@jsmart.com',
            phoneNumber: '1234567890',
            password: 'Admin@123',
            userRoleId: adminRole.id
        };

        const registerResponse = await fetch(`${API_URL}/users/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
        });

        if (!registerResponse.ok) {
            const error = await registerResponse.json();
            console.error('❌ Failed to create admin user:', error.message);

            if (error.message.includes('already registered')) {
                console.log('\n✅ Admin user already exists!');
                console.log('📧 Email: admin@jsmart.com');
                console.log('🔑 Password: Admin@123');
            }
            return;
        }

        const result = await registerResponse.json();
        console.log('✅ Admin user created successfully!\n');
        console.log('📧 Email: admin@jsmart.com');
        console.log('🔑 Password: Admin@123');
        console.log('\n⚠️  Note: You may need to verify the email with OTP.');
        console.log('Check the backend console for the OTP code.\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.log('\n💡 Make sure the backend is running on http://localhost:5000');
    }
}

createAdminUser();
