from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from employees.models import Employee
from .models import Attendance
from .serializers import AttendanceSerializer


class AttendanceListCreateView(APIView):
    def get(self, request):
        qs = Attendance.objects.select_related('employee').all()

        # Filters
        employee_id = request.query_params.get('employee_id')
        date_filter = request.query_params.get('date')
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        status_filter = request.query_params.get('status')

        if employee_id:
            qs = qs.filter(employee_id=employee_id)
        if date_filter:
            qs = qs.filter(date=date_filter)
        if start_date:
            qs = qs.filter(date__gte=start_date)
        if end_date:
            qs = qs.filter(date__lte=end_date)
        if status_filter:
            qs = qs.filter(status=status_filter)

        serializer = AttendanceSerializer(qs, many=True)
        return Response({
            'count': qs.count(),
            'results': serializer.data
        })

    def post(self, request):
        serializer = AttendanceSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


class AttendanceDetailView(APIView):
    def put(self, request, pk):
        record = get_object_or_404(Attendance, pk=pk)
        serializer = AttendanceSerializer(record, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        record = get_object_or_404(Attendance, pk=pk)
        record.delete()
        return Response({'message': 'Attendance record deleted.'}, status=status.HTTP_200_OK)


class EmployeeAttendanceView(APIView):
    def get(self, request, employee_pk):
        employee = get_object_or_404(Employee, pk=employee_pk)
        qs = employee.attendance_records.all()

        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        if start_date:
            qs = qs.filter(date__gte=start_date)
        if end_date:
            qs = qs.filter(date__lte=end_date)

        serializer = AttendanceSerializer(qs, many=True)
        total_present = qs.filter(status='Present').count()
        total_absent = qs.filter(status='Absent').count()

        return Response({
            'employee_id': employee.id,
            'employee_name': employee.full_name,
            'total_present': total_present,
            'total_absent': total_absent,
            'count': qs.count(),
            'results': serializer.data
        })
