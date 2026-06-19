const Apartment = require('../models/Apartment');
const Complaint = require('../models/Complaint');
const Collection = require('../models/Collection');

/** Get GeoJSON for apartments */
const getApartmentsGeo = async () => {
  const apartments = await Apartment.find({ isActive: true }, { location: 1, name: 1, address: 1 }).lean();
  const features = apartments.map((apt) => ({
    type: 'Feature',
    geometry: apt.location,
    properties: {
      id: apt._id,
      name: apt.name,
      address: apt.address,
      type: 'apartment'
    },
  }));
  return { type: 'FeatureCollection', features };
};

/** Get GeoJSON for complaints, including those associated with apartments */
const getComplaintsGeo = async () => {
  const complaints = await Complaint.find({ status: { $ne: 'rejected' } })
    .populate('apartment', 'location')
    .lean();
    
  const features = [];
  
  for (const c of complaints) {
    let coords = null;
    if (c.location && c.location.lat && c.location.lng) {
      coords = [c.location.lng, c.location.lat];
    } else if (c.apartment && c.apartment.location && c.apartment.location.coordinates) {
      coords = c.apartment.location.coordinates;
    }
    
    if (coords) {
      features.push({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: coords,
        },
        properties: {
          id: c._id,
          type: 'complaint',
          complaintType: c.type,
          status: c.status,
          priority: c.priority,
          title: c.title
        },
      });
    }
  }
  return { type: 'FeatureCollection', features };
};

/** Get GeoJSON for collections (routes) – simplified as points for start and end */
const getCollectionsGeo = async () => {
  const collections = await Collection.find({ status: { $in: ['completed', 'verified', 'disputed'] } })
    .populate('apartment', 'name location')
    .lean();
    
  const features = collections.flatMap((col) => {
    const arr = [];
    if (col.startLocation && col.startLocation.lat && col.startLocation.lng) {
      arr.push({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [col.startLocation.lng, col.startLocation.lat] },
        properties: { id: col._id, type: 'collection_start', status: col.status },
      });
    }
    if (col.endLocation && col.endLocation.lat && col.endLocation.lng) {
      arr.push({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [col.endLocation.lng, col.endLocation.lat] },
        properties: { id: col._id, type: 'collection_end', status: col.status },
      });
    }
    return arr;
  });
  return { type: 'FeatureCollection', features };
};

/** Get GeoJSON for violations (disputed collections and critical anomalies) */
const getViolationsGeo = async () => {
  const [disputedCollections, criticalComplaints] = await Promise.all([
    Collection.find({ verificationStatus: 'disputed' }).populate('apartment', 'location').lean(),
    Complaint.find({ priority: 'critical', status: { $ne: 'resolved' } }).populate('apartment', 'location').lean()
  ]);

  const features = [];

  for (const col of disputedCollections) {
    if (col.apartment && col.apartment.location && col.apartment.location.coordinates) {
      features.push({
        type: 'Feature',
        geometry: col.apartment.location,
        properties: {
          id: col._id,
          type: 'violation',
          violationType: 'disputed_collection',
          status: col.status
        }
      });
    }
  }

  for (const c of criticalComplaints) {
    let coords = null;
    if (c.location && c.location.lat && c.location.lng) {
      coords = [c.location.lng, c.location.lat];
    } else if (c.apartment && c.apartment.location && c.apartment.location.coordinates) {
      coords = c.apartment.location.coordinates;
    }
    
    if (coords) {
      features.push({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: coords,
        },
        properties: {
          id: c._id,
          type: 'violation',
          violationType: 'critical_complaint',
          status: c.status
        },
      });
    }
  }

  return { type: 'FeatureCollection', features };
};

/** Get generic Heatmap data points (weighted by priority/severity) */
const getHeatmapData = async () => {
  const complaintsGeo = await getComplaintsGeo();
  
  const heatPoints = complaintsGeo.features.map(f => {
    let intensity = 1;
    switch (f.properties.priority) {
      case 'critical': intensity = 4; break;
      case 'high': intensity = 3; break;
      case 'medium': intensity = 2; break;
      case 'low': intensity = 1; break;
      default: intensity = 1;
    }
    return {
      lat: f.geometry.coordinates[1],
      lng: f.geometry.coordinates[0],
      intensity
    };
  });

  return heatPoints;
};

module.exports = {
  getApartmentsGeo,
  getComplaintsGeo,
  getCollectionsGeo,
  getViolationsGeo,
  getHeatmapData
};
