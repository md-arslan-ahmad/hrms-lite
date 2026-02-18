from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Employee
from .serializers import EmployeeSerializer


class EmployeeListCreateView(APIView):
    def get(self, request):
        employees = Employee.objects.all()
        serializer = EmployeeSerializer(employees, many=True)
        return Response({
            'count': employees.count(),
            'results': serializer.data
        })

    def post(self, request):
        serializer = EmployeeSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


class EmployeeDetailView(APIView):
    def get(self, request, pk):
        employee = get_object_or_404(Employee, pk=pk)
        serializer = EmployeeSerializer(employee)
        return Response(serializer.data)

    def delete(self, request, pk):
        employee = get_object_or_404(Employee, pk=pk)
        name = employee.full_name
        employee.delete()
        return Response({'message': f'Employee "{name}" deleted successfully.'}, status=status.HTTP_200_OK)


class DashboardSummaryView(APIView):
    def get(self, request):
        from attendance.models import Attendance
        from django.db.models import Count
        from datetime import date

        total_employees = Employee.objects.count()
        total_present_today = Attendance.objects.filter(date=date.today(), status='Present').count()
        total_absent_today = Attendance.objects.filter(date=date.today(), status='Absent').count()

        dept_counts = (
            Employee.objects.values('department')
            .annotate(count=Count('id'))
            .order_by('department')
        )

        return Response({
            'total_employees': total_employees,
            'total_present_today': total_present_today,
            'total_absent_today': total_absent_today,
            'departments': list(dept_counts),
        })
