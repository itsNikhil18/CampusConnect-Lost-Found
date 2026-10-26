from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    role = serializers.ChoiceField(choices=[("student", "Student"), ("staff", "Staff")])

    class Meta:
        model = User
        fields = ["id", "username", "first_name", "last_name", "email", "password", "password_confirm", "role"]
        read_only_fields = ["id"]

    def validate_email(self, value):
        value = value.strip().lower()
        # This checks the expected college domain; it does not prove ownership of the mailbox.
        if not value.endswith("@mitwpu.edu.in"):
            raise serializers.ValidationError("Use your MIT-WPU email address ending in @mitwpu.edu.in.")
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value

    def validate(self, attrs):
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError({"password_confirm": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop("password_confirm")
        role = validated_data.pop("role")
        password = validated_data.pop("password")
        # Store role as a basic profile field only if profile model is added later;
        # for this starter, use Django's built-in groups.
        user = User.objects.create_user(password=password, **validated_data)
        from django.contrib.auth.models import Group
        group, _ = Group.objects.get_or_create(name=role)
        user.groups.add(group)
        return user

class UserSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "username", "first_name", "last_name", "email", "role"]

    def get_role(self, obj):
        if obj.groups.filter(name="staff").exists():
            return "staff"
        return "student"


from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        identifier = attrs.get(self.username_field, "")
        User = get_user_model()
        if "@" in identifier:
            user = User.objects.filter(email__iexact=identifier).first()
            if user:
                attrs[self.username_field] = user.get_username()
        return super().validate(attrs)
