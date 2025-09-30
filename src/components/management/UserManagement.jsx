import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthProvider";
import userManagementApi from "../../api/userManagementApi";
import Button from "../common/Button";
import Picture from "../common/Picture";
import InputField from "../common/InputField";
import SelectField from "../common/SelectField";
import Toast from "../common/Toast";
import AltAvatar from "../../assets/alt_avatar.png";
import { useNavigate } from "react-router-dom";
import { 
  Users, 
  Search,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

export default function UserManagement() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [users, setUsers] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(5);
  
  const [selectedUser, setSelectedUser] = useState(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [newRole, setNewRole] = useState("");

  // Fetch users with loading
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await userManagementApi.getAllUsers({ 
        page: currentPage, 
        limit, 
        search: searchTerm, 
        role: roleFilter 
      });
      setUsers(response.data.users);
      setPagination(response.data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  // Fetch users without loading (for search)
  const fetchUsersSilent = async () => {
    try {
      setError(null);
      const response = await userManagementApi.getAllUsers({ 
        page: currentPage, 
        limit, 
        search: searchTerm, 
        role: roleFilter 
      });
      setUsers(response.data.users);
      setPagination(response.data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch users");
    }
  };

  // Fetch user stats
  const fetchUserStats = async () => {
    try {
      const response = await userManagementApi.getUserStatsByRole();
      setUserStats(response.data);
    } catch (err) {
      console.error("Failed to fetch user stats:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchUserStats();
  }, [currentPage, roleFilter]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== undefined) {
        fetchUsersSilent();
      }
    }, 500); // 500ms delay

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleRoleFilter = (role) => {
    setRoleFilter(role);
    setCurrentPage(1);
  };

  const handleUpdateRole = async () => {
    try {
      await userManagementApi.updateUserRole(selectedUser._id, newRole);
      setShowRoleModal(false);
      setSelectedUser(null);
      setNewRole("");
      fetchUsers(); // Refresh users list
      setToast({
        type: "success",
        message: `Đã cập nhật role của ${selectedUser.name} thành ${newRole}`
      });
    } catch (error) {
      console.error("Failed to update role:", error);
      setToast({
        type: "error",
        message: "Không thể cập nhật role. Vui lòng thử lại."
      });
    }
  };

  const handleDeleteUser = async (userId) => {
    const userToDelete = users.find(user => user._id === userId);
    if (window.confirm("Bạn có chắc chắn muốn xóa user này?")) {
      try {
        await userManagementApi.deleteUser(userId);
        fetchUsers(); // Refresh users list
        setToast({
          type: "success",
          message: `Đã xóa người dùng ${userToDelete?.name || 'này'}`
        });
      } catch (error) {
        console.error("Failed to delete user:", error);
        setToast({
          type: "error",
          message: "Không thể xóa người dùng. Vui lòng thử lại."
        });
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'user':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
      </div>

      <div className="space-y-6">
        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        {userStats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-500">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Tổng Người dùng</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {(userStats.user || 0) + (userStats.admin || 0)}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-red-500">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Admins</p>
                  <p className="text-2xl font-bold text-gray-900">{userStats.admin || 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-500">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Người dùng</p>
                  <p className="text-2xl font-bold text-gray-900">{userStats.user || 0}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <InputField
                  type="text"
                  placeholder="Tìm kiếm theo tên, MSSV, email..."
                  value={searchTerm}
                  onChange={handleSearch}
                  variant="rounded"
                  className="pl-10 w-full border border-gray-300"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <SelectField
                value={roleFilter}
                onChange={(e) => handleRoleFilter(e.target.value)}
                variant="rounded"
                className="border border-gray-300"
                options={[
                  { value: "", label: "Tất cả" },
                  { value: "admin", label: "Admin" },
                  { value: "user", label: "Người dùng" }
                ]}
              />
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Người dùng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    MSSV
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày tạo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Picture
                          src={user.avatarUrl || AltAvatar}
                          alt="User Avatar"
                          size="sm"
                          variant="circle"
                          className="w-10 h-10"
                        />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.gender}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.mssv}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => {
                            setSelectedUser(user);
                            setNewRole(user.role);
                            setShowRoleModal(true);
                          }}
                          variant="icon"
                          className="text-blue-600 hover:bg-blue-50"
                          title="Thay đổi role"
                        >
                          <Edit className="h-5 w-5" />
                        </Button>
                        <Button
                          onClick={() => handleDeleteUser(user._id)}
                          variant="icon" 
                          className="text-red-600 hover:border-red-500 hover:bg-red-50"
                          title="Xóa người dùng"
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <Button
                variant="rounded"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="border border-gray-300"
              />
              <div className="flex items-center">
                <span className="text-sm font-bold text-gray-900">
                  Trang {currentPage}/{pagination?.pages || 1}
                </span>
              </div>
              <Button
                variant="rounded"
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={currentPage >= (pagination?.pages || 1)}
                className="border border-gray-300"
              />
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-bold text-gray-900">
                  Trang {currentPage}/{pagination?.pages || 1}
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    disabled={currentPage >= (pagination?.pages || 1)}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="fixed inset-0 bg-black/30 backdropk bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-600">Đang xử lý...</p>
            </div>
          </div>
        )}
      </div>

      {/* Role Update Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-black/30 backdrop bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Thay đổi Role
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Người dùng: <span className="font-medium">{selectedUser?.name}</span>
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role mới
              </label>
              <SelectField
                fieldName="Chọn role"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                variant="rounded"
                className="border border-gray-300"
                options={[
                  { value: "user", label: "Người dùng" },
                  { value: "admin", label: "Admin" }
                ]}
              />
            </div>
            <div className="flex justify-end space-x-3">
              <Button
                text="Hủy"
                variant="rounded"
                onClick={() => setShowRoleModal(false)}
                className="border border-gray-300"
              />
              <Button
                text="Cập nhật"
                variant="rounded"
                onClick={handleUpdateRole}
                className="border border-gray-300"
              />
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast
          key={toast.message + toast.type}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
