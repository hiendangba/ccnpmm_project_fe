import MainPage from './HomePage';
import Button from '../common/Button';
import { useState, useEffect } from "react";
import userApi from "../../api/userApi"
import Toast from "../common/Toast";

export default function ListMemberPage() {
  const [students, setStudents] = useState([]);
  const [total, setTotal] = useState(0);  
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await userApi.all({
          page: currentPage,
          limit: rowsPerPage
        });
        console.log(res)
        setStudents(res.users); // giả sử API trả về mảng sinh viên
        setTotal(res.total);

      } catch (err) {
        const message = err.response?.data?.message || err.message || "lấy thông tin users thất bại";
        setToast({ type: 'error', message });      
      } 
    };

    fetchStudents();
  }, []);

  const data = students || [];
  // Pagination
  const rowsPerPage = 5;
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(total / rowsPerPage);

  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentData = data.slice(startIndex, startIndex + rowsPerPage);

  return (
    <MainPage>
      <div className="flex-1 flex items-center justify-center w-full">
        <div
          className="bg-white/70 backdrop-blur 
                      py-10 px-12 
                      flex flex-col items-center
                      gap-6
                      rounded-2xl 
                      shadow-xl 
                      border border-white/50 w-[900px]">
          <h1
            className="text-4xl text-black 
                        font-bold 
                        drop-shadow-lg mb-2">
            Danh sách sinh viên
          </h1>

          <table className="w-full border-collapse shadow-md rounded-lg overflow-hidden text-[20px]">
            <thead className="bg-gradient-to-r from-green-300 to-green-400 text-white">
              <tr>
                <th className="py-3 px-4 border text-left">Tên</th>
                <th className="py-3 px-4 border text-left">MSSV</th>
                <th className="py-3 px-4 border">Email</th>
                <th className="py-3 px-4 border">Năm sinh</th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((student, index) => (
                <tr
                  key={index}
                  className={`transition ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  } hover:bg-green-100`}
                >
                  <td className="py-3 px-4 border text-left">{student.name}</td>
                  <td className="py-3 px-4 border text-left">{student.mssv}</td>
                  <td className="py-3 px-4 border">{student.email}</td>
                  <td className="py-3 px-4 border">{student.dateOfBirth}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination controls */}
          <div className="flex justify-between items-center w-full mt-4">
            <Button
              text="Trang trước"
              className="w-[150px]"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
            />
            <span className="text-lg font-semibold">
              Trang {currentPage} / {totalPages}
            </span>
            <Button
              text="Trang sau"
              className="w-[150px]"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
            />
          </div>
        </div>
      </div>
    </MainPage>
  );
}
