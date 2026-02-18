from rest_framework import serializers
from .models import Attendance
from employees.models import Employee


class AttendanceSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    employee_id_code = serializers.CharField(source='employee.employee_id', read_only=True)
    department = serializers.CharField(source='employee.department', read_only=True)

    class Meta:
        model = Attendance
        fields = ['id', 'employee', 'employee_name', 'employee_id_code', 'department', 'date', 'status', 'created_at']
        read_only_fields = ['id', 'created_at', 'employee_name', 'employee_id_code', 'department']

    def validate_status(self, value):
        if value not in ['Present', 'Absent']:
            raise serializers.ValidationError("Status must be 'Present' or 'Absent'.")
        return value

    def validate(self, data):
        employee = data.get('employee')
        date = data.get('date')
        instance = self.instance

        qs = Attendance.objects.filter(employee=employee, date=date)
        if instance:
            qs = qs.exclude(pk=instance.pk)
        if qs.exists():
            raise serializers.ValidationError(
                {'date': f'Attendance for this employee on {date} already exists.'}
            )
        return data
