# Stage 1: Build Stage
FROM maven:3.9.9-eclipse-temurin-17 AS build

# ตั้ง working directory
WORKDIR /app

# Copy pom.xml และ download dependencies (cache layer)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code
COPY src ./src

# Build application
RUN mvn clean package -DskipTests

# Stage 2: Runtime Stage
FROM eclipse-temurin:17-jre-jammy

# ตั้ง working directory
WORKDIR /app

# Copy JAR file จาก build stage
COPY --from=build /app/target/*.jar app.jar

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:8080/api/webhook || exit 1

# Run application
ENTRYPOINT ["java", "-jar", "app.jar"]