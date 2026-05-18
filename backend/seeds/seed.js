require('dotenv').config();
const bcrypt = require('bcryptjs');
const {
  sequelize,
  User,
  EmployeeProfile,
  DocumentType,
  Document,
  ChecklistItem,
  ChecklistProgress,
  SetupToken,
} = require('../models');
const { encrypt } = require('../utils/crypto');
const { generateTokenString } = require('../utils/setupTokenUtil');

const educationSample = [
  { degree: 'B.Tech', institution: 'Mumbai University', year: 2017 },
];

async function seed() {
  try {
    await sequelize.sync({ force: true });
    console.log('Database synced (tables dropped and recreated).');

    const hrPassword = await bcrypt.hash('hr123456', 12);
    const hrUser = await User.create({
      email: 'hr@company.com',
      password: hrPassword,
      name: 'HR Manager',
      role: 'hr',
      is_first_login: false,
      onboarding_status: 'Profile Complete',
      profile_complete: true,
    });

    const emp1Password = await bcrypt.hash('emp123456', 12);
    const emp1 = await User.create({
      email: 'john@example.com',
      password: emp1Password,
      name: 'John Doe',
      role: 'employee',
      is_first_login: false,
      onboarding_status: 'Profile Complete',
      profile_complete: true,
    });

    const emp2Password = await bcrypt.hash('emp123456', 12);
    const emp2 = await User.create({
      email: 'jane@example.com',
      password: emp2Password,
      name: 'Jane Smith',
      role: 'employee',
      is_first_login: false,
      onboarding_status: 'Documents Approved',
      profile_complete: true,
    });

    const emp3Password = await bcrypt.hash('emp123456', 12);
    const emp3 = await User.create({
      email: 'bob@example.com',
      password: emp3Password,
      name: 'Bob Wilson',
      role: 'employee',
      is_first_login: false,
      onboarding_status: 'Joining Confirmed',
      profile_complete: true,
      joining_date: '2026-06-01',
    });

    const profileDefaults = {
      phone: '9876543210',
      date_of_birth: '1995-06-15',
      gender: 'male',
      address: '123 Main Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      postal_code: '400001',
      bank_account_number: encrypt('12345678901'),
      pan_number: encrypt('ABCDE1234F'),
      emergency_contact_name: 'Mary Doe',
      emergency_contact_phone: '9876543211',
      education_json: educationSample,
    };

    await EmployeeProfile.create({ user_id: emp1.id, ...profileDefaults });
    await EmployeeProfile.create({
      user_id: emp2.id,
      ...profileDefaults,
      phone: '9876543212',
      date_of_birth: '1998-09-22',
      gender: 'female',
      address: '456 Park Avenue',
      city: 'Bangalore',
      state: 'Karnataka',
      postal_code: '560001',
      bank_account_number: encrypt('23456789012'),
      pan_number: encrypt('FGHIJ5678K'),
      emergency_contact_name: 'Jack Smith',
      emergency_contact_phone: '9876543213',
    });
    await EmployeeProfile.create({
      user_id: emp3.id,
      ...profileDefaults,
      phone: '9876543214',
      date_of_birth: '1992-12-01',
      gender: 'male',
      address: '789 Lake Road',
      city: 'Delhi',
      state: 'Delhi',
      postal_code: '110001',
      bank_account_number: encrypt('34567890123'),
      pan_number: encrypt('KLMNO9012P'),
      emergency_contact_name: 'Alice Wilson',
      emergency_contact_phone: '9876543215',
    });

    const docTypes = await DocumentType.bulkCreate([
      {
        code: 'id_proof',
        name: 'ID Proof',
        is_mandatory: true,
        max_size_bytes: 5 * 1024 * 1024,
        allowed_extensions: 'pdf,jpg,jpeg,png',
        description: 'Government-issued photo ID (Aadhar, Passport, etc.)',
      },
      {
        code: 'address_proof',
        name: 'Address Proof',
        is_mandatory: true,
        max_size_bytes: 5 * 1024 * 1024,
        allowed_extensions: 'pdf,jpg,jpeg,png',
        description: 'Utility bill, rental agreement, or bank statement',
      },
      {
        code: 'education',
        name: 'Education Certificate',
        is_mandatory: true,
        max_size_bytes: 5 * 1024 * 1024,
        allowed_extensions: 'pdf,jpg,jpeg,png',
        description: 'Highest educational degree certificate',
      },
      {
        code: 'experience',
        name: 'Experience Certificate',
        is_mandatory: true,
        max_size_bytes: 5 * 1024 * 1024,
        allowed_extensions: 'pdf,jpg,jpeg,png',
        description: 'Previous employment / experience letter',
      },
      {
        code: 'photo',
        name: 'Passport Photo',
        is_mandatory: false,
        max_size_bytes: 2 * 1024 * 1024,
        allowed_extensions: 'pdf,jpg,jpeg,png',
        description: 'Recent passport-size photograph (PDF or image)',
      },
    ]);

    const mandatoryTypes = docTypes.filter((d) => d.is_mandatory);
    for (const emp of [emp2, emp3]) {
      for (const dt of mandatoryTypes) {
        await Document.create({
          user_id: emp.id,
          document_type_id: dt.id,
          filename: `sample-${dt.code}.pdf`,
          original_name: `${dt.code}.pdf`,
          mime_type: 'application/pdf',
          file_size: 102400,
          status: 'approved',
          verified_by: hrUser.id,
          verified_at: new Date(),
        });
      }
    }

    const checklistItems = await ChecklistItem.bulkCreate([
      { code: 'sign_nda', title: 'Sign NDA', description: 'Sign the non-disclosure agreement', is_mandatory: true, sort_order: 1 },
      { code: 'it_form', title: 'Complete IT Form', description: 'Submit IT asset and access request form', is_mandatory: true, sort_order: 2 },
      { code: 'handbook', title: 'Read Employee Handbook', description: 'Read and acknowledge the employee handbook', is_mandatory: true, sort_order: 3 },
      { code: 'bank_details', title: 'Bank Account Details', description: 'Verify bank details for salary processing', is_mandatory: true, sort_order: 4 },
      { code: 'id_card', title: 'Employee ID Card', description: 'Collect employee ID card from HR', is_mandatory: false, sort_order: 5 },
      { code: 'orientation', title: 'Orientation Session', description: 'Attend new employee orientation', is_mandatory: false, sort_order: 6 },
    ]);

    for (const item of checklistItems) {
      await ChecklistProgress.create({
        user_id: emp3.id,
        checklist_item_id: item.id,
        completed: true,
        completed_at: new Date(),
      });
    }

    for (let i = 0; i < 3; i++) {
      await ChecklistProgress.create({
        user_id: emp2.id,
        checklist_item_id: checklistItems[i].id,
        completed: true,
        completed_at: new Date(),
      });
    }

    const demoToken = generateTokenString();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await SetupToken.create({
      token: demoToken,
      email: 'newhire@example.com',
      name: 'New Hire Demo',
      expires_at: expiresAt,
    });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    console.log('Seed data created successfully!');
    console.log('');
    console.log('Login Credentials:');
    console.log('  HR:       hr@company.com / hr123456');
    console.log('  Employee: john@example.com / emp123456');
    console.log('  Employee: jane@example.com / emp123456');
    console.log('  Employee: bob@example.com / emp123456');
    console.log('');
    console.log('Demo setup token (invite new employee):');
    console.log(`  Email: newhire@example.com`);
    console.log(`  Token: ${demoToken}`);
    console.log(`  Link:  ${frontendUrl}/setup?token=${demoToken}`);

    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
}

seed();
