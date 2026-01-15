import React, { useState } from 'react';
import { Search, MapPin, Droplet, Phone, Mail, Filter, X, User, Clock, Award, Navigation } from 'lucide-react';
import { Link } from "react-router-dom";

export default function FindDonorsPage() {
  const [filters, setFilters] = useState({
    bloodGroup: '',
    location: '',
    distance: '10',
    availability: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  
  const donors = [
    { 
      id: 1, 
      name: 'Rajesh Kumar', 
      bloodGroup: 'O+', 
      location: 'Sector 17, Chandigarh', 
      distance: '2.3 km',
      phone: '+91 98765 43210',
      email: 'rajesh.k@email.com',
      lastDonation: '90 days ago',
      donations: 12,
      availability: 'Available',
      verified: true
    },
    { 
      id: 2, 
      name: 'Priya Singh', 
      bloodGroup: 'A+', 
      location: 'Phase 7, Mohali', 
      distance: '5.1 km',
      phone: '+91 98765 43211',
      email: 'priya.s@email.com',
      lastDonation: '120 days ago',
      donations: 8,
      availability: 'Available',
      verified: true
    },
    { 
      id: 3, 
      name: 'Amit Sharma', 
      bloodGroup: 'B+', 
      location: 'Sector 22, Chandigarh', 
      distance: '3.8 km',
      phone: '+91 98765 43212',
      email: 'amit.sh@email.com',
      lastDonation: '45 days ago',
      donations: 15,
      availability: 'Not Available',
      verified: true
    },
    { 
      id: 4, 
      name: 'Neha Patel', 
      bloodGroup: 'O+', 
      location: 'Sector 35, Chandigarh', 
      distance: '4.2 km',
      phone: '+91 98765 43213',
      email: 'neha.p@email.com',
      lastDonation: '95 days ago',
      donations: 6,
      availability: 'Available',
      verified: false
    },
    { 
      id: 5, 
      name: 'Vikram Reddy', 
      bloodGroup: 'AB+', 
      location: 'Phase 11, Mohali', 
      distance: '7.5 km',
      phone: '+91 98765 43214',
      email: 'vikram.r@email.com',
      lastDonation: '100 days ago',
      donations: 20,
      availability: 'Available',
      verified: true
    },
    { 
      id: 6, 
      name: 'Sonia Verma', 
      bloodGroup: 'O-', 
      location: 'Sector 21, Panchkula', 
      distance: '8.9 km',
      phone: '+91 98765 43215',
      email: 'sonia.v@email.com',
      lastDonation: '110 days ago',
      donations: 10,
      availability: 'Available',
      verified: true
    }
  ];

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const filteredDonors = donors.filter(donor => {
    if (filters.bloodGroup && donor.bloodGroup !== filters.bloodGroup) return false;
    if (filters.availability !== 'all' && donor.availability !== filters.availability) return false;
    if (searchQuery && !donor.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !donor.location.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 via-white to-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Droplet className="h-8 w-8 text-red-600" fill="currentColor" />
              <span className="text-2xl font-bold text-gray-900">LifeStream</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/home" className="text-gray-700 hover:text-red-600 transition">Home</Link>
              <Link to="/about" className="text-gray-700 hover:text-red-600 transition">About</Link>
              <Link to="/find-donors" className="text-red-600 font-medium">Find Donors</Link>
              <Link to="/contact" className="text-gray-700 hover:text-red-600 transition">Contact</Link>
            </div>
            <div className="flex items-center space-x-3">
              <button className="px-4 py-2 text-red-600 hover:text-red-700 font-medium transition">
                Login
              </button>
              <button className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition shadow-md">
                Register as Donor
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-red-600 to-red-700 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Find Blood Donors Near You</h1>
            <p className="text-xl text-red-100 max-w-3xl mx-auto">
              Search our database of verified donors and connect with potential lifesavers in your area
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl p-6">
              <div className="grid md:grid-cols-12 gap-4">
                <div className="md:col-span-8">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by name or location..."
                      className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-lg"
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <select
                    value={filters.bloodGroup}
                    onChange={(e) => handleFilterChange('bloodGroup', e.target.value)}
                    className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-lg"
                  >
                    <option value="">All Blood Types</option>
                    {bloodGroups.map(group => (
                      <option key={group} value={group}>{group}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <button 
                    onClick={() => setShowFilters(!showFilters)}
                    className="w-full px-6 py-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold flex items-center justify-center space-x-2"
                  >
                    <Filter className="h-5 w-5" />
                    <span>Filters</span>
                  </button>
                </div>
              </div>

              {/* Advanced Filters */}
              {showFilters && (
                <div className="mt-6 pt-6 border-t grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Distance (km)</label>
                    <select
                      value={filters.distance}
                      onChange={(e) => handleFilterChange('distance', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    >
                      <option value="5">Within 5 km</option>
                      <option value="10">Within 10 km</option>
                      <option value="25">Within 25 km</option>
                      <option value="50">Within 50 km</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Availability</label>
                    <select
                      value={filters.availability}
                      onChange={(e) => handleFilterChange('availability', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    >
                      <option value="all">All Donors</option>
                      <option value="Available">Available Only</option>
                      <option value="Not Available">Not Available</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={() => setFilters({ bloodGroup: '', location: '', distance: '10', availability: 'all' })}
                      className="w-full px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              {filteredDonors.length} Donors Found
            </h2>
            <div className="flex items-center space-x-2 text-gray-600">
              <MapPin className="h-5 w-5" />
              <span>Sorted by distance</span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDonors.map(donor => (
              <div key={donor.id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition overflow-hidden">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-14 w-14 bg-red-100 rounded-full flex items-center justify-center">
                        <User className="h-7 w-7 text-red-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg flex items-center space-x-2">
                          <span>{donor.name}</span>
                          {donor.verified && (
                            <span className="text-blue-600" title="Verified Donor">✓</span>
                          )}
                        </h3>
                        <p className="text-sm text-gray-500">ID: LS{donor.id.toString().padStart(4, '0')}</p>
                      </div>
                    </div>
                  </div>

                  {/* Blood Group Badge */}
                  <div className="flex items-center justify-center mb-4">
                    <div className="px-6 py-3 bg-red-600 rounded-full">
                      <span className="text-3xl font-bold text-white">{donor.bloodGroup}</span>
                    </div>
                  </div>

                  {/* Donor Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <Award className="h-5 w-5 text-yellow-600 mx-auto mb-1" />
                      <p className="text-xl font-bold text-gray-900">{donor.donations}</p>
                      <p className="text-xs text-gray-600">Donations</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <Clock className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                      <p className="text-sm font-bold text-gray-900">{donor.lastDonation}</p>
                      <p className="text-xs text-gray-600">Last Donation</p>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-center space-x-2 text-gray-600 mb-3">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm">{donor.location}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600 mb-4">
                    <Navigation className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm font-semibold text-red-600">{donor.distance} away</span>
                  </div>

                  {/* Availability Status */}
                  <div className="mb-4">
                    <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                      donor.availability === 'Available' 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {donor.availability}
                    </span>
                  </div>

                  {/* Contact Buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    <button className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center justify-center space-x-2">
                      <Phone className="h-4 w-4" />
                      <span>Call</span>
                    </button>
                    <button className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium flex items-center justify-center space-x-2">
                      <Mail className="h-4 w-4" />
                      <span>Email</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredDonors.length === 0 && (
            <div className="text-center py-16">
              <Droplet className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No Donors Found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your search criteria or filters</p>
              <button 
                onClick={() => {
                  setFilters({ bloodGroup: '', location: '', distance: '10', availability: 'all' });
                  setSearchQuery('');
                }}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-red-600 to-red-700 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Can't Find a Match?
          </h2>
          <p className="text-xl text-red-100 mb-8">
            Post a blood request and we'll notify all matching donors in your area
          </p>
          <button className="px-10 py-4 bg-white text-red-600 rounded-lg hover:bg-gray-100 transition shadow-lg text-lg font-bold">
            Request Blood Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Droplet className="h-8 w-8 text-red-600" fill="currentColor" />
                <span className="text-2xl font-bold">LifeStream</span>
              </div>
              <p className="text-gray-400">
                Connecting donors with those in need, one drop at a time.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition">About Us</a></li>
                <li><a href="#" className="hover:text-white transition">Find Donors</a></li>
                <li><a href="#" className="hover:text-white transition">Request Blood</a></li>
                <li><a href="#" className="hover:text-white transition">FAQs</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition">Eligibility</a></li>
                <li><a href="#" className="hover:text-white transition">Blood Types</a></li>
                <li><a href="#" className="hover:text-white transition">Donation Process</a></li>
                <li><a href="#" className="hover:text-white transition">Health Tips</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Contact</h4>
              <p className="text-gray-400">24/7 Emergency Support</p>
              <p className="text-gray-400">+91-1800-DONATE</p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 LifeStream. All rights reserved. Saving lives, one donation at a time.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}