import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import AddUserModal from '../components/AddUserModal';
import AddStoreModal from '../components/AddStoreModal';
import UserDetailsModal from '../components/UserDetailsModal';
import StoreDetailsModal from '../components/StoreDetailsModal';
import { Users, Store, Star, Search, PlusCircle, SlidersHorizontal, LayoutDashboard } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ totalUsers: 0, totalStores: 0, totalRatings: 0 });
  const [activeTab, setActiveTab] = useState('overview');

  const [usersList, setUsersList] = useState([]);
  const [storesList, setStoresList] = useState([]);
  const [loadingList, setLoadingList] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  
  // Advanced Specific Filters State
  const [nameFilter, setNameFilter] = useState('');
  const [emailFilter, setEmailFilter] = useState('');
  const [addressFilter, setAddressFilter] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Sorting State
  const [userSort, setUserSort] = useState({ field: 'name', order: 'ASC' });
  const [storeSort, setStoreSort] = useState({ field: 'name', order: 'ASC' });

  // Modal Control State
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [selectedStoreId, setSelectedStoreId] = useState(null);
  const [isStoreDetailModalOpen, setIsStoreDetailModalOpen] = useState(false);

  const { token, API_BASE_URL, logout } = useAuth();
  const { showToast } = useToast();

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.status === 401 || response.status === 403) {
        logout();
        showToast('Your session has expired. Please log in again.', 'error');
        return;
      }
      const data = await response.json();
      if (response.ok) {
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const fetchUsers = async () => {
    setLoadingList(true);
    try {
      const params = new URLSearchParams({
        search: searchQuery,
        sortBy: userSort.field,
        sortOrder: userSort.order,
      });
      if (roleFilter) params.append('role', roleFilter);
      if (nameFilter) params.append('name', nameFilter);
      if (emailFilter) params.append('email', emailFilter);
      if (addressFilter) params.append('address', addressFilter);

      const response = await fetch(`${API_BASE_URL}/admin/users?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.status === 401 || response.status === 403) {
        logout();
        showToast('Your session has expired. Please log in again.', 'error');
        return;
      }
      const data = await response.json();
      if (response.ok) {
        setUsersList(data);
      }
    } catch {
      showToast('Failed to load users list.', 'error');
    } finally {
      setLoadingList(false);
    }
  };

  const fetchStores = async () => {
    setLoadingList(true);
    try {
      const params = new URLSearchParams({
        search: searchQuery,
        sortBy: storeSort.field,
        sortOrder: storeSort.order,
      });
      if (nameFilter) params.append('name', nameFilter);
      if (emailFilter) params.append('email', emailFilter);
      if (addressFilter) params.append('address', addressFilter);

      const response = await fetch(`${API_BASE_URL}/admin/stores?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.status === 401 || response.status === 403) {
        logout();
        showToast('Your session has expired. Please log in again.', 'error');
        return;
      }
      const data = await response.json();
      if (response.ok) {
        setStoresList(data);
      }
    } catch {
      showToast('Failed to load stores list.', 'error');
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'stores') {
      fetchStores();
    }
  }, [activeTab, searchQuery, roleFilter, userSort, storeSort, nameFilter, emailFilter, addressFilter]);

  const handleUserSort = (field) => {
    setUserSort((prev) => ({
      field,
      order: prev.field === field && prev.order === 'ASC' ? 'DESC' : 'ASC',
    }));
  };

  const handleStoreSort = (field) => {
    setStoreSort((prev) => ({
      field,
      order: prev.field === field && prev.order === 'ASC' ? 'DESC' : 'ASC',
    }));
  };

  const handleRowClick = (userId) => {
    setSelectedUserId(userId);
    setIsDetailModalOpen(true);
  };

  const handleStoreRowClick = (storeId) => {
    setSelectedStoreId(storeId);
    setIsStoreDetailModalOpen(true);
  };

  const handleRefreshData = () => {
    fetchStats();
    if (activeTab === 'users') fetchUsers();
    else if (activeTab === 'stores') fetchStores();
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchQuery('');
    setRoleFilter('');
    setNameFilter('');
    setEmailFilter('');
    setAddressFilter('');
  };

  const chartData = [
    { name: 'Total Users', count: stats.totalUsers, fill: 'var(--color-info)' },
    { name: 'Registered Stores', count: stats.totalStores, fill: 'var(--color-success)' },
    { name: 'Total Ratings', count: stats.totalRatings, fill: 'var(--color-warning)' }
  ];

  return (
    <div className="admin-layout-wrapper">
      {/* Sidebar Navigation */}
      <aside className="admin-sidebar">
        <h3>
          <SlidersHorizontal size={20} style={{ color: 'var(--color-indigo)' }} />
          Admin Menu
        </h3>
        
        <button 
          className={`sidebar-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => handleTabChange('overview')}
        >
          <LayoutDashboard size={18} />
          <span>Dashboard Overview</span>
        </button>

        <button 
          className={`sidebar-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => handleTabChange('users')}
        >
          <Users size={18} />
          <span>Users List</span>
        </button>

        <button 
          className={`sidebar-btn ${activeTab === 'stores' ? 'active' : ''}`}
          onClick={() => handleTabChange('stores')}
        >
          <Store size={18} />
          <span>Stores List</span>
        </button>
      </aside>

      {/* Main Area */}
      <main className="admin-main-content">
        <div className="dashboard-title-row" style={{ marginBottom: '1rem' }}>
          <div>
            <h1>System Administrator</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Manage store accounts, user databases, and platform ratings</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn btn-primary" onClick={() => setIsUserModalOpen(true)}>
              <PlusCircle size={18} />
              <span>Add User</span>
            </button>
            <button className="btn btn-primary" style={{ background: 'linear-gradient(135deg, var(--color-violet) 0%, var(--color-pink) 100%)', boxShadow: '0 4px 15px rgba(139, 92, 246, 0.25)' }} onClick={() => setIsStoreModalOpen(true)}>
              <PlusCircle size={18} />
              <span>Add Store</span>
            </button>
          </div>
        </div>

        {activeTab === 'overview' && (
          <div style={{ animation: 'fadeInUp 0.4s ease' }}>
            {/* Counters Stats Grid */}
            <div className="dashboard-stats-grid">
              <div className="stat-card glass-panel">
                <div className="stat-card-icon">
                  <Users size={24} />
                </div>
                <div className="stat-card-info">
                  <h3>Total Registered Users</h3>
                  <p>{stats.totalUsers}</p>
                </div>
              </div>

              <div className="stat-card glass-panel">
                <div className="stat-card-icon" style={{ color: 'var(--color-success)', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                  <Store size={24} />
                </div>
                <div className="stat-card-info">
                  <h3>Registered Stores</h3>
                  <p>{stats.totalStores}</p>
                </div>
              </div>

              <div className="stat-card glass-panel">
                <div className="stat-card-icon" style={{ color: 'var(--color-warning)', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                  <Star size={24} />
                </div>
                <div className="stat-card-info">
                  <h3>Ratings Submitted</h3>
                  <p>{stats.totalRatings}</p>
                </div>
              </div>
            </div>

            {/* Bar Chart Panel */}
            <div className="glass-panel" style={{ padding: '1.5rem', marginTop: '1.5rem' }}>
              <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', color: 'var(--text-primary)' }}>
                <LayoutDashboard size={20} style={{ color: 'var(--color-indigo)' }} />
                Platform Statistics Graph
              </h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                Visual comparison of overall system growth and activity metrics.
              </p>
              
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                    <XAxis dataKey="name" stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)' }} tickLine={false} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                    <YAxis stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)' }} tickLine={false} axisLine={false} />
                    <Tooltip 
                      cursor={{ fill: 'rgba(255,255,255,0.03)' }} 
                      contentStyle={{ backgroundColor: '#1f2937', borderColor: 'rgba(255,255,255,0.1)', color: '#f9fafb', borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }} 
                      itemStyle={{ color: '#f9fafb', fontWeight: 600 }}
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={60} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {(activeTab === 'users' || activeTab === 'stores') && (
          <div style={{ animation: 'fadeInUp 0.4s ease' }}>
            {/* Table filters */}
            <div className="search-filter-bar" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
              <div className="search-input-wrapper" style={{ flex: 1 }}>
                <Search size={18} className="search-icon-inside" />
                <input
                  type="text"
                  className="form-input"
                  placeholder={activeTab === 'users' ? "Search users by Name, Email, Address..." : "Search stores by Name, Email, Address..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {activeTab === 'users' && (
                <select
                  className="filter-select"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <option value="">All Roles</option>
                  <option value="admin">System Admin</option>
                  <option value="owner">Store Owner</option>
                  <option value="user">Normal User</option>
                </select>
              )}

              <button
                className="btn btn-secondary"
                onClick={() => setShowAdvanced(!showAdvanced)}
                style={{
                  borderColor: showAdvanced ? 'var(--color-indigo)' : '',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1rem'
                }}
              >
                <SlidersHorizontal size={16} />
                <span>{showAdvanced ? 'Hide Column Filters' : 'Column Filters'}</span>
              </button>
            </div>

            {/* Advanced Filters Panel */}
            {showAdvanced && (
              <div className="glass-panel" style={{
                padding: '1.25rem',
                marginBottom: '1.5rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                animation: 'fadeInUp 0.3s ease'
              }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.8rem', marginBottom: '0.25rem' }}>Name contains</label>
                  <input
                    type="text"
                    className="form-input"
                    style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}
                    placeholder="e.g. System"
                    value={nameFilter}
                    onChange={(e) => setNameFilter(e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.8rem', marginBottom: '0.25rem' }}>Email contains</label>
                  <input
                    type="text"
                    className="form-input"
                    style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}
                    placeholder="e.g. admin@"
                    value={emailFilter}
                    onChange={(e) => setEmailFilter(e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.8rem', marginBottom: '0.25rem' }}>Address contains</label>
                  <input
                    type="text"
                    className="form-input"
                    style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}
                    placeholder="e.g. Cityville"
                    value={addressFilter}
                    onChange={(e) => setAddressFilter(e.target.value)}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <button
                    className="btn btn-secondary"
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      fontSize: '0.85rem',
                      background: 'rgba(255, 0, 0, 0.05)',
                      borderColor: 'rgba(239, 68, 68, 0.2)',
                      color: 'var(--color-danger)'
                    }}
                    onClick={() => {
                      setNameFilter('');
                      setEmailFilter('');
                      setAddressFilter('');
                    }}
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            )}

            {/* Lists Displays */}
            <div className="glass-panel" style={{ padding: '1.25rem', overflow: 'hidden' }}>
              {loadingList ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    border: '3px solid rgba(255, 255, 255, 0.05)',
                    borderTopColor: 'var(--color-indigo)',
                    animation: 'spin 1s linear infinite'
                  }} />
                </div>
              ) : activeTab === 'users' ? (
                usersList.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-secondary)' }}>
                    <Users size={48} style={{ opacity: 0.25, margin: '0 auto 1rem auto' }} />
                    <p>No user records matching search filters were found.</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="custom-table">
                      <thead>
                        <tr>
                          <th onClick={() => handleUserSort('name')}>
                            Full Name {userSort.field === 'name' && <span className="sort-indicator">{userSort.order === 'ASC' ? '▲' : '▼'}</span>}
                          </th>
                          <th onClick={() => handleUserSort('email')}>
                            Email Address {userSort.field === 'email' && <span className="sort-indicator">{userSort.order === 'ASC' ? '▲' : '▼'}</span>}
                          </th>
                          <th onClick={() => handleUserSort('address')}>
                            Address {userSort.field === 'address' && <span className="sort-indicator">{userSort.order === 'ASC' ? '▲' : '▼'}</span>}
                          </th>
                          <th onClick={() => handleUserSort('role')}>
                            Role Tag {userSort.field === 'role' && <span className="sort-indicator">{userSort.order === 'ASC' ? '▲' : '▼'}</span>}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {usersList.map((userRow) => (
                          <tr key={userRow.id} style={{ cursor: 'pointer' }} onClick={() => handleRowClick(userRow.id)}>
                            <td style={{ fontWeight: 600 }}>{userRow.name}</td>
                            <td>{userRow.email}</td>
                            <td style={{ maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {userRow.address}
                            </td>
                            <td>
                              <span className={`role-tag ${userRow.role}`}>{userRow.role}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              ) : (
                storesList.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-secondary)' }}>
                    <Store size={48} style={{ opacity: 0.25, margin: '0 auto 1rem auto' }} />
                    <p>No store records matching search filters were found.</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="custom-table">
                      <thead>
                        <tr>
                          <th>Image</th>
                          <th onClick={() => handleStoreSort('name')}>
                            Store Name {storeSort.field === 'name' && <span className="sort-indicator">{storeSort.order === 'ASC' ? '▲' : '▼'}</span>}
                          </th>
                          <th onClick={() => handleStoreSort('email')}>
                            Email Address {storeSort.field === 'email' && <span className="sort-indicator">{storeSort.order === 'ASC' ? '▲' : '▼'}</span>}
                          </th>
                          <th onClick={() => handleStoreSort('address')}>
                            Address {storeSort.field === 'address' && <span className="sort-indicator">{storeSort.order === 'ASC' ? '▲' : '▼'}</span>}
                          </th>
                          <th onClick={() => handleStoreSort('rating')}>
                            Average Rating {storeSort.field === 'rating' && <span className="sort-indicator">{storeSort.order === 'ASC' ? '▲' : '▼'}</span>}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {storesList.map((storeRow) => (
                          <tr key={storeRow.id} style={{ cursor: 'pointer' }} onClick={() => handleStoreRowClick(storeRow.id)}>
                            <td style={{ padding: '0.5rem 1rem' }}>
                              <img 
                                src={storeRow.imageUrl ? (storeRow.imageUrl.startsWith('/') ? `${API_BASE_URL.replace('/api', '')}${storeRow.imageUrl}` : storeRow.imageUrl) : `https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=100&h=100&fit=crop&q=80&sig=${storeRow.id}`} 
                                alt={storeRow.name}
                                className="store-image-thumb"
                                loading="lazy"
                              />
                            </td>
                            <td style={{ fontWeight: 600 }}>{storeRow.name}</td>
                            <td>{storeRow.email}</td>
                            <td style={{ maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {storeRow.address}
                            </td>
                            <td>
                              <span className="rating-badge" style={{ display: 'inline-flex' }}>
                                <Star size={14} fill="currentColor" />
                                {storeRow.rating > 0 ? storeRow.rating.toFixed(2) : '0.00'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </main>

      {/* Add User Modal */}
      <AddUserModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        onRefresh={handleRefreshData}
      />

      {/* Add Store Modal */}
      <AddStoreModal
        isOpen={isStoreModalOpen}
        onClose={() => setIsStoreModalOpen(false)}
        onRefresh={handleRefreshData}
      />

      {/* View User Details Modal */}
      <UserDetailsModal
        isOpen={isDetailModalOpen}
        userId={selectedUserId}
        onClose={() => { setIsDetailModalOpen(false); setSelectedUserId(null); }}
      />

      {/* View Store Details Modal */}
      <StoreDetailsModal
        isOpen={isStoreDetailModalOpen}
        storeId={selectedStoreId}
        onClose={() => { setIsStoreDetailModalOpen(false); setSelectedStoreId(null); }}
      />
    </div>
  );
};

export default AdminDashboard;
