const { EmployeeProfile, User } = require('../models');
const { encrypt, maskEncrypted } = require('../utils/crypto');
const { isProfileComplete } = require('../utils/onboarding');

function formatProfileResponse(profile) {
  if (!profile) return null;
  const result = profile.toJSON ? profile.toJSON() : { ...profile };
  result.bank_account_number = maskEncrypted(result.bank_account_number);
  result.pan_number = maskEncrypted(result.pan_number);
  return result;
}

const getProfile = async (req, res, next) => {
  try {
    const profile = await EmployeeProfile.findOne({ where: { user_id: req.user.id } });
    res.json({ profile: formatProfileResponse(profile) });
  } catch (err) {
    next(err);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const {
      phone, date_of_birth, gender, address, city, state, postal_code,
      bank_account_number, pan_number,
      emergency_contact_name, emergency_contact_phone,
      education_json, education,
    } = req.body;

    let parsedEducation = education_json;
    if (education && !parsedEducation) {
      parsedEducation = typeof education === 'string' ? JSON.parse(education) : education;
    }
    if (typeof parsedEducation === 'string') {
      try {
        parsedEducation = JSON.parse(parsedEducation);
      } catch {
        return res.status(400).json({ error: 'Invalid education_json format.' });
      }
    }

    const profileData = {
      phone,
      date_of_birth,
      gender,
      address,
      city,
      state,
      postal_code,
      emergency_contact_name,
      emergency_contact_phone,
    };

    if (parsedEducation) {
      profileData.education_json = parsedEducation;
    }

    if (bank_account_number) {
      profileData.bank_account_number = encrypt(bank_account_number);
    }
    if (pan_number) {
      profileData.pan_number = encrypt(pan_number);
    }

    const [profile, created] = await EmployeeProfile.findOrCreate({
      where: { user_id: req.user.id },
      defaults: { user_id: req.user.id, ...profileData },
    });

    if (!created) {
      await profile.update(profileData);
    }

    const updatedProfile = await EmployeeProfile.findOne({ where: { user_id: req.user.id } });
    const complete = isProfileComplete(updatedProfile);

    if (complete) {
      await User.update(
        { onboarding_status: 'Profile Complete', profile_complete: true },
        { where: { id: req.user.id, onboarding_status: 'Profile Incomplete' } }
      );
      await User.update(
        { profile_complete: true },
        { where: { id: req.user.id } }
      );
    } else {
      await User.update(
        { profile_complete: false },
        { where: { id: req.user.id } }
      );
    }

    res.json({
      profile: formatProfileResponse(updatedProfile),
      profile_complete: complete,
      message: 'Profile updated successfully.',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getProfile, updateProfile };
