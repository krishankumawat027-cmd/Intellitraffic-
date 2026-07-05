'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/auth';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';

const reportTypes = [
  { id: 'accident', label: 'Accident', icon: '🚨', description: 'Vehicle collision or crash' },
  { id: 'traffic_jam', label: 'Traffic Jam', icon: '🚗', description: 'Heavy traffic congestion' },
  { id: 'broken_signal', label: 'Broken Signal', icon: '🚦', description: 'Traffic light malfunction' },
  { id: 'road_damage', label: 'Road Damage', icon: '🔧', description: 'Potholes, cracks, or damage' },
  { id: 'illegal_parking', label: 'Illegal Parking', icon: '🅿️', description: 'Vehicles parked illegally' },
  { id: 'flood', label: 'Flood', icon: '🌊', description: 'Water accumulation on road' },
  { id: 'construction', label: 'Construction', icon: '🏗️', description: 'Road work or construction' },
  { id: 'other', label: 'Other', icon: '📌', description: 'Other traffic-related issue' },
];

export default function ReportIncidentPage() {
  const [type, setType] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const { profile } = useAuthStore();
  const router = useRouter();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !type || !title) return;

    setIsSubmitting(true);

    try {
      let imageUrl = null;

      // Upload image if provided
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${profile.user_id}/${Date.now()}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('reports')
          .upload(fileName, imageFile);

        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from('reports')
            .getPublicUrl(fileName);
          imageUrl = urlData.publicUrl;
        }
      }

      // Create report
      const { error } = await supabase
        .from('citizen_reports')
        .insert({
          user_id: profile.user_id,
          type,
          title,
          description,
          image_url: imageUrl,
          location_address: location,
          status: 'pending',
          priority: 'normal',
        });

      if (error) throw error;

      setSuccess(true);
      setTimeout(() => router.push('/dashboard/history'), 2000);
    } catch (error) {
      console.error('Error submitting report:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-xl p-8 text-center"
        >
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
            <span className="text-4xl">✓</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Report Submitted!</h2>
          <p className="text-gray-400">Thank you for your report. Our team will review it shortly.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Report an Incident</h1>
        <p className="text-gray-400">Help improve traffic by reporting issues you encounter</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Report Type */}
        <div className="glass rounded-xl p-6">
          <label className="block text-sm font-medium text-white mb-4">Select Incident Type</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {reportTypes.map((t) => (
              <motion.button
                key={t.id}
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setType(t.id)}
                className={`p-4 rounded-xl text-center transition-all ${
                  type === t.id
                    ? 'bg-cyan-500/20 border-2 border-cyan-500'
                    : 'bg-white/5 border-2 border-transparent hover:border-white/20'
                }`}
              >
                <span className="text-3xl block mb-2">{t.icon}</span>
                <span className={`text-sm font-medium ${type === t.id ? 'text-cyan-400' : 'text-white'}`}>
                  {t.label}
                </span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div className="glass rounded-xl p-6">
          <label className="block text-sm font-medium text-white mb-2">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Brief description of the incident"
            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
            required
          />
        </div>

        {/* Description */}
        <div className="glass rounded-xl p-6">
          <label className="block text-sm font-medium text-white mb-2">Details</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide more details about the incident..."
            rows={4}
            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 resize-none"
          />
        </div>

        {/* Location */}
        <div className="glass rounded-xl p-6">
          <label className="block text-sm font-medium text-white mb-2">Location</label>
          <div className="flex gap-4">
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter address or location"
              className="flex-1 px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
            />
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              📍 Use My Location
            </motion.button>
          </div>
        </div>

        {/* Image Upload */}
        <div className="glass rounded-xl p-6">
          <label className="block text-sm font-medium text-white mb-2">Photo (Optional)</label>
          {imagePreview ? (
            <div className="relative">
              <img src={imagePreview} alt="Preview" className="w-full max-h-64 object-cover rounded-lg" />
              <button
                type="button"
                onClick={() => { setImageFile(null); setImagePreview(null); }}
                className="absolute top-2 right-2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70"
              >
                ✕
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/20 rounded-lg cursor-pointer hover:border-cyan-500/50 transition-colors">
              <span className="text-4xl mb-2">📷</span>
              <span className="text-sm text-gray-400">Click to upload image</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.back()}
            className="flex-1 py-3 rounded-lg bg-white/10 text-white font-medium hover:bg-white/20 transition-colors"
          >
            Cancel
          </motion.button>
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={!type || !title || isSubmitting}
            className="flex-1 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </motion.button>
        </div>
      </form>
    </div>
  );
}
