import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AttendanceTable } from '@/components/shared/AttendanceTable';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ErrorMessage } from '@/components/shared/ErrorMessage';
import { CorrectionForm } from '@/components/employee/CorrectionForm';

import api from '@/services/api';
import { API_ENDPOINTS } from '@/utils/constants';

import type { Attendance, ApiResponse } from '@/types';

export const AttendanceHistory: React.FC = () => {
  const [showCorrectionForm, setShowCorrectionForm] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState<Attendance | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['attendance'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Attendance[]>>(
        API_ENDPOINTS.MY_ATTENDANCE
      );

      return response.data.data || [];
    },
  });

  if (isLoading) {
    return (
      <div className="card">
        <div className="flex justify-center items-center py-8">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <ErrorMessage message="Failed to load attendance history" />
      </div>
    );
  }

  return (
    <>
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            My Attendance History
          </h3>

          <div className="text-sm text-gray-500">
            Total Records: {data?.length || 0}
          </div>
        </div>

        <div className="space-y-4">
          {data?.map((attendance) => (
            <div
              key={attendance.id}
              className="border rounded-lg p-4 flex justify-between items-center"
            >
              <div>
                <p className="font-medium">
                  {new Date(attendance.date).toLocaleDateString()}
                </p>

                <p className="text-sm text-gray-500">
                  Status: {attendance.status}
                </p>
              </div>

              <button
                onClick={() => {
                  setSelectedAttendance(attendance);
                  setShowCorrectionForm(true);
                }}
                className="btn-primary"
              >
                Request Correction
              </button>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <AttendanceTable attendances={data || []} />
        </div>
      </div>

      {showCorrectionForm && selectedAttendance && (
        <CorrectionForm
          attendanceId={selectedAttendance.id}
          currentCheckIn={selectedAttendance.check_in}
          currentCheckOut={selectedAttendance.check_out}
          onClose={() => {
            setShowCorrectionForm(false);
            setSelectedAttendance(null);
          }}
        />
      )}
    </>
  );
};
