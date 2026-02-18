from rest_framework import serializers
from .models import Employee


class EmployeeSerializer(serializers.ModelSerializer):
    total_present_days = serializers.SerializerMethodField()

    class Meta:
        model = Employee
        fields = ['id', 'employee_id', 'full_name', 'email', 'department', 'created_at', 'total_present_days']
        read_only_fields = ['id', 'created_at', 'total_present_days']

    def get_total_present_days(self, obj):
        return obj.attendance_records.filter(status='Present').count()

    def validate_employee_id(self, value):
        if not value.strip():
            raise serializers.ValidationError("Employee ID cannot be empty.")
        instance = self.instance
        qs = Employee.objects.filter(employee_id=value)
        if instance:
            qs = qs.exclude(pk=instance.pk)
        if qs.exists():
            raise serializers.ValidationError("An employee with this ID already exists.")
        return value.strip()

    def validate_email(self, value):
        instance = self.instance
        qs = Employee.objects.filter(email=value.lower())
        if instance:
            qs = qs.exclude(pk=instance.pk)
        if qs.exists():
            raise serializers.ValidationError("An employee with this email already exists.")
        return value.lower()

    def validate_full_name(self, value):
        if not value.strip():
            raise serializers.ValidationError("Full name cannot be empty.")
        return value.strip()

    def validate_department(self, value):
        if not value.strip():
            raise serializers.ValidationError("Department cannot be empty.")
        return value.strip()
