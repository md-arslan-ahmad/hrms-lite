from django.urls import path
from .views import AttendanceListCreateView, AttendanceDetailView, EmployeeAttendanceView

urlpatterns = [
    path('attendance/', AttendanceListCreateView.as_view(), name='attendance-list-create'),
    path('attendance/<int:pk>/', AttendanceDetailView.as_view(), name='attendance-detail'),
    path('employees/<int:employee_pk>/attendance/', EmployeeAttendanceView.as_view(), name='employee-attendance'),
]
