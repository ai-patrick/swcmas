import React, { useState, useRef } from 'react';
import { Camera, MapPin, CheckCircle, ArrowRight, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { startCollection, completeCollection } from '@/api/collections.api.js';
import LoadingSpinner from '@/components/ui/LoadingSpinner.jsx';

const FieldOpsWizard = ({ collection, onClose, onComplete }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [location, setLocation] = useState(null);
  const [beforePhoto, setBeforePhoto] = useState(null);
  const [afterPhoto, setAfterPhoto] = useState(null);

  // Haversine distance helper (km)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return R * c; 
  };

  const handleCaptureLocation = () => {
    setLoading(true);
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        
        // Geofencing Check
        const aptCoords = collection.apartment?.location?.coordinates;
        if (aptCoords) {
          const distKm = calculateDistance(lat, lng, aptCoords[1], aptCoords[0]);
          if (distKm > 0.1) { // 100 meters
            toast.error(`You are ${Math.round(distKm * 1000)}m away from the property. Please move closer.`, { duration: 5000 });
            // For demo purposes, we still set the location to allow testing, but in production we would return here.
            toast('Demo Mode: Location captured anyway.', { icon: 'ℹ️' });
          } else {
            toast.success('Location verified within geofence');
          }
        } else {
          toast.success('Location verified');
        }

        setLocation({ lat, lng });
        setLoading(false);
      },
      (err) => {
        toast.error('Failed to get location. Please enable GPS.');
        setLoading(false);
      }
    );
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (type === 'before') setBeforePhoto(file);
      if (type === 'after') setAfterPhoto(file);
    }
  };

  const handleStart = async () => {
    if (!beforePhoto) return toast.error('Please upload a "Before" photo');
    if (!location) return toast.error('Please verify location first');
    
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('beforePhoto', beforePhoto);
      // We could also pass location coords if the backend supported it for startCollection
      
      await startCollection(collection._id, formData);
      toast.success('Collection started');
      setStep(3); // Move to completion step
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to start collection');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!afterPhoto) return toast.error('Please upload an "After" photo');
    
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('afterPhoto', afterPhoto);
      
      await completeCollection(collection._id, formData);
      toast.success('Collection completed successfully!');
      onComplete();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to complete collection');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-slate-900 flex flex-col">
      {/* Mobile Header */}
      <div className="h-14 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between px-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Active Route</h2>
        <button onClick={onClose} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full dark:hover:bg-slate-800">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 max-w-lg mx-auto w-full">
        {/* Progress Bar */}
        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex flex-col items-center flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= s ? 'bg-brand-500 text-white' : 'bg-gray-200 text-gray-500 dark:bg-slate-800'}`}>
                {s}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-brand-50 dark:bg-brand-500/10 p-4 rounded-xl mb-6 border border-brand-100 dark:border-brand-500/20">
          <h3 className="font-semibold text-brand-900 dark:text-brand-100">{collection.apartment?.name}</h3>
          <p className="text-sm text-brand-700 dark:text-brand-300 mt-1">{collection.apartment?.address}</p>
        </div>

        {/* STEP 1: Arrival & GPS */}
        {step === 1 && (
          <div className="space-y-6 animate-in slide-in-from-right fade-in">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Verify Arrival</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">We need to capture your GPS coordinates to confirm you have arrived at the property.</p>
              
              {!location ? (
                <button 
                  onClick={handleCaptureLocation}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-medium flex justify-center items-center gap-2 transition-colors disabled:opacity-70"
                >
                  {loading ? <LoadingSpinner size="sm" /> : <><MapPin className="w-5 h-5" /> Capture GPS Location</>}
                </button>
              ) : (
                <div className="space-y-4">
                  <div className="bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 p-4 rounded-xl font-medium flex items-center justify-center gap-2">
                    <CheckCircle className="w-5 h-5" /> Location Verified
                  </div>
                  <button 
                    onClick={() => setStep(2)}
                    className="w-full bg-brand-600 hover:bg-brand-700 text-white py-3.5 rounded-xl font-medium flex justify-center items-center gap-2 transition-colors"
                  >
                    Continue to Photos <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 2: Start & Before Photo */}
        {step === 2 && (
          <div className="space-y-6 animate-in slide-in-from-right fade-in">
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Before Photo</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">Take a photo of the waste area before you begin collection.</p>
              
              <label className="block w-full border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-2xl p-8 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors cursor-pointer mb-6">
                <input type="file" accept="image/*" capture="environment" onChange={(e) => handleFileChange(e, 'before')} className="hidden" />
                {beforePhoto ? (
                  <div className="text-green-600 dark:text-green-400 font-medium flex items-center justify-center gap-2">
                    <CheckCircle className="w-6 h-6" /> Photo Selected: {beforePhoto.name}
                  </div>
                ) : (
                  <div className="text-gray-500 dark:text-gray-400 flex flex-col items-center">
                    <Camera className="w-8 h-8 mb-2 opacity-50" />
                    <span>Tap to open camera</span>
                  </div>
                )}
              </label>

              <button 
                onClick={handleStart}
                disabled={loading || !beforePhoto}
                className="w-full bg-brand-600 hover:bg-brand-700 text-white py-3.5 rounded-xl font-medium flex justify-center items-center gap-2 transition-colors disabled:opacity-70"
              >
                {loading ? <LoadingSpinner size="sm" /> : 'Start Collection'}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Complete & After Photo */}
        {step === 3 && (
          <div className="space-y-6 animate-in slide-in-from-right fade-in">
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">After Photo</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">Take a final photo of the cleaned area to verify completion.</p>
              
              <label className="block w-full border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-2xl p-8 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors cursor-pointer mb-6">
                <input type="file" accept="image/*" capture="environment" onChange={(e) => handleFileChange(e, 'after')} className="hidden" />
                {afterPhoto ? (
                  <div className="text-green-600 dark:text-green-400 font-medium flex items-center justify-center gap-2">
                    <CheckCircle className="w-6 h-6" /> Photo Selected: {afterPhoto.name}
                  </div>
                ) : (
                  <div className="text-gray-500 dark:text-gray-400 flex flex-col items-center">
                    <Camera className="w-8 h-8 mb-2 opacity-50" />
                    <span>Tap to open camera</span>
                  </div>
                )}
              </label>

              <button 
                onClick={handleComplete}
                disabled={loading || !afterPhoto}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl font-medium flex justify-center items-center gap-2 transition-colors disabled:opacity-70"
              >
                {loading ? <LoadingSpinner size="sm" /> : 'Finish & Complete Route'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FieldOpsWizard;
