const ResidentVerification = require('../models/ResidentVerification');
const Collection = require('../models/Collection');
const Apartment = require('../models/Apartment');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

/** Generate verification requests for a specific collection.
 *  Randomly selects up to `maxResidents` residents from the apartment.
 */
const generateForCollection = async (collectionId, maxResidents = 3) => {
  const collection = await Collection.findById(collectionId).populate('apartment');
  if (!collection) throw new ApiError(404, 'Collection not found');
  const apartment = collection.apartment;
  if (!apartment) throw new ApiError(404, 'Apartment not associated with collection');

  // Find residents linked to the apartment – assuming User with role 'resident' and maybe a relationship. For simplicity, we consider all users with role 'resident' as potential.
  const residents = await User.find({ role: 'resident', isActive: true }).limit(maxResidents);

  const verifications = [];
  for (const resident of residents) {
    const existing = await ResidentVerification.findOne({ collection: collectionId, resident: resident._id });
    if (existing) continue; // avoid duplicates
    const rv = new ResidentVerification({
      collection: collectionId,
      resident: resident._id,
      apartment: apartment._id,
      wasCollected: false, // default until resident responds
    });
    await rv.save();
    verifications.push(rv);
  }
  return verifications;
};

/** Resident submits verification response */
const submitResponse = async (verificationId, residentId, wasCollected, notes) => {
  const rv = await ResidentVerification.findOne({ _id: verificationId, resident: residentId });
  if (!rv) throw new ApiError(404, 'Verification request not found');
  rv.wasCollected = wasCollected;
  if (notes) rv.notes = notes;
  rv.respondedAt = new Date();
  await rv.save();
  return rv;
};

/** List pending verifications for a resident */
const listForResident = async (residentId, { page = 1, limit = 20 }) => {
  const skip = (page - 1) * limit;
  const verifications = await ResidentVerification.find({ resident: residentId })
    .populate('collection apartment')
    .skip(skip)
    .limit(limit);
  const total = await ResidentVerification.countDocuments({ resident: residentId });
  return { verifications, total, page, limit };
};

module.exports = { generateForCollection, submitResponse, listForResident };
