import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Link } from 'react-router-dom';

export default function Profile({ session }) {
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState(null);
  const [stats, setStats] = useState({
    totalAttempted: 0,
    correctAnswers: 0,
    averageScore: 0,
  });

  useEffect(() => {
    getProfile();
  }, [session]);

  async function getProfile() {
    try {
      setLoading(true);
      const { user } = session;

      let { data: profile, error } = await supabase
        .from('profiles')
        .select('username, total_attempted, correct_answers')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      // If profile doesn't exist, create one
      if (!profile) {
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert([{ id: user.id }])
          .select()
          .single();

        if (insertError) throw insertError;
        profile = newProfile;
      }

      if (profile) {
        setUsername(profile.username);
        setStats({
          totalAttempted: profile.total_attempted || 0,
          correctAnswers: profile.correct_answers || 0,
          averageScore: profile.total_attempted ? 
            ((profile.correct_answers / profile.total_attempted) * 100).toFixed(2) : 0,
        });
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function updateProfile() {
    try {
      setLoading(true);
      const { user } = session;

      const updates = {
        id: user.id,
        username,
        updated_at: new Date(),
      };

      const { error } = await supabase.from('profiles').upsert(updates);

      if (error) throw error;
      alert('Profile updated!');
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="space-y-8 divide-y divide-gray-200">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">Profile</h3>
              <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-4">
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                    Username
                  </label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <input
                      type="text"
                      name="username"
                      id="username"
                      value={username || ''}
                      onChange={(e) => setUsername(e.target.value)}
                      className="flex-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full min-w-0 rounded-md sm:text-sm border-gray-300"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Statistics</h3>
              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
                <div className="bg-indigo-50 overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Attempted</dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.totalAttempted}</dd>
                  </div>
                </div>
                <div className="bg-green-50 overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <dt className="text-sm font-medium text-gray-500 truncate">Correct Answers</dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.correctAnswers}</dd>
                  </div>
                </div>
                <div className="bg-blue-50 overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <dt className="text-sm font-medium text-gray-500 truncate">Average Score</dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.averageScore}%</dd>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-between">
            <button
              onClick={updateProfile}
              disabled={loading}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
            <Link
              to="/questions"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Start Test
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}