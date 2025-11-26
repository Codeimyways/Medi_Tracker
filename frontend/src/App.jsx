import React, { useState, useEffect } from 'react';
import { AlertCircle, Plus, Check, HeartPulse, Pill, Phone } from 'lucide-react';

// NOTE: Ensure your backend is running on port 5000
const API_URL = 'http://localhost:5000/api';

function App() {
  const [meds, setMeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  // Form State
  const [newMed, setNewMed] = useState({
    name: '',
    dosage: '',
    frequency: '',
    total_stock: 30
  });

  // Fetch medications from Backend
  const fetchMeds = async () => {
    try {
      const response = await fetch(`${API_URL}/meds`);
      const data = await response.json();
      setMeds(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching meds:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeds();
  }, []);

  // Handle Input Change
  const handleInputChange = (e) => {
    setNewMed({ ...newMed, [e.target.name]: e.target.value });
  };

  // Submit New Medication
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch(`${API_URL}/meds`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMed)
      });
      setShowForm(false);
      fetchMeds(); // Refresh list
      setNewMed({ name: '', dosage: '', frequency: '', total_stock: 30 });
    } catch (error) {
      alert("Error adding medication");
    }
  };

  // Handle "Take Dose"
  const takeDose = async (id) => {
    try {
      const res = await fetch(`${API_URL}/meds/${id}/take`, { method: 'POST' });
      if (res.ok) {
        fetchMeds(); // Refresh list to update stock
      } else {
        alert("Could not take dose (maybe out of stock?)");
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Send SOS (Mock function)
  const sendSOS = () => {
    alert("SOS ALERT SENT! \nLocation: Home \nContacting Emergency Contacts...");
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      {/* Header */}
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <HeartPulse size={28} />
            <h1 className="text-xl font-bold">MediTrack</h1>
          </div>
          <button 
            onClick={sendSOS}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full font-bold flex items-center gap-2 animate-pulse"
          >
            <Phone size={18} /> SOS
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4">
        
        {/* Dashboard Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-gray-500 text-sm">Active Meds</h3>
            <p className="text-2xl font-bold text-blue-600">{meds.length}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-gray-500 text-sm">Low Stock Alerts</h3>
            <p className="text-2xl font-bold text-red-500">
              {meds.filter(m => m.total_stock <= m.low_stock_threshold).length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 col-span-2 md:col-span-1">
            <h3 className="text-gray-500 text-sm">Adherence (Today)</h3>
            <p className="text-2xl font-bold text-green-600">100%</p>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Your Medications</h2>
          <button 
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
          >
            <Plus size={20} /> Add New
          </button>
        </div>

        {/* Add Medication Form */}
        {showForm && (
          <div className="bg-white p-6 rounded-xl shadow-md mb-8 border border-blue-100">
            <h3 className="font-semibold mb-4">Add New Prescription</h3>
            <form onSubmit={handleSubmit} className="grid gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input required name="name" placeholder="Medication Name (e.g. Aspirin)" value={newMed.name} onChange={handleInputChange} className="p-2 border rounded" />
                <input required name="dosage" placeholder="Dosage (e.g. 50mg)" value={newMed.dosage} onChange={handleInputChange} className="p-2 border rounded" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input required name="frequency" placeholder="Frequency (e.g. Daily)" value={newMed.frequency} onChange={handleInputChange} className="p-2 border rounded" />
                <input required type="number" name="total_stock" placeholder="Initial Stock" value={newMed.total_stock} onChange={handleInputChange} className="p-2 border rounded" />
              </div>
              <button type="submit" className="bg-green-600 text-white py-2 rounded hover:bg-green-700">Save Medication</button>
            </form>
          </div>
        )}

        {/* Medication List */}
        <div className="grid gap-4">
          {loading ? <p>Loading...</p> : meds.map(med => (
            <div key={med.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition hover:shadow-md">
              
              <div className="flex items-start gap-4">
                <div className="bg-blue-50 p-3 rounded-full text-blue-600">
                  <Pill size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{med.name} <span className="text-sm font-normal text-gray-500">({med.dosage})</span></h3>
                  <p className="text-gray-600 text-sm">{med.frequency}</p>
                  
                  {/* Stock Indicator */}
                  <div className={`mt-2 inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${med.total_stock <= med.low_stock_threshold ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {med.total_stock <= med.low_stock_threshold ? <AlertCircle size={12}/> : null}
                    Stock: {med.total_stock} left
                  </div>
                </div>
              </div>

              <div className="w-full md:w-auto">
                <button 
                  onClick={() => takeDose(med.id)}
                  disabled={med.total_stock === 0}
                  className={`w-full md:w-auto px-6 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition
                    ${med.total_stock > 0 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                >
                  <Check size={18} /> {med.total_stock > 0 ? 'Mark Taken' : 'Refill Needed'}
                </button>
              </div>

            </div>
          ))}
          
          {!loading && meds.length === 0 && (
            <div className="text-center py-10 text-gray-500">
              No medications added yet. Click "Add New" to start.
            </div>
          )}
        </div>

      </main>
    </div>
  );
}

export default App;