import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

type Profile = {
  id: string;
  name: string;
  email: string;
  approved: boolean;
};

export function AdminPanel() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadUsers() {
    setLoading(true);

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('approved', false);

    if (!error && data) {
      setUsers(data);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function approveUser(id: string) {
    const { error } = await supabase
      .from('profiles')
      .update({ approved: true })
      .eq('id', id);

    if (!error) {
      loadUsers();
    }
  }

  async function rejectUser(id: string) {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);

    if (!error) {
      loadUsers();
    }
  }

  return (
    <div className="mt-10 rounded-2xl bg-white p-6 shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Pending Requests</h2>

      {loading ? (
        <p>Loading...</p>
      ) : users.length === 0 ? (
        <p>No pending requests</p>
      ) : (
        <div className="space-y-4">
          {users.map((user) => (
            <div
              key={user.id}
              className="border rounded-lg p-4 flex justify-between items-center"
            >
              <div>
                <p className="font-semibold">{user.name}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => approveUser(user.id)}
                  className="bg-green-500 text-white px-4 py-2 rounded"
                >
                  Approve
                </button>

                <button
                  onClick={() => rejectUser(user.id)}
                  className="bg-red-500 text-white px-4 py-2 rounded"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}