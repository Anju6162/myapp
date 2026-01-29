pipeline {
    agent any

    tools {
        maven 'maven-3'
    }

    parameters {
        booleanParam(
            name: 'RUN_SONAR',
            defaultValue: false,
            description: 'Run SonarQube Analysis'
        )
    }

    environment {
        NEXUS_IP        = "3.110.219.178"
        NEXUS_MAVEN_REPO = "maven-releases"
        NEXUS_DOCKER_REPO = "docker-hosted"
        APP_NAME        = "myapp"
        IMAGE_TAG       = "latest"
    }

    stages {

        stage('Checkout') {
            steps {
                git url: 'https://github.com/Anju6162/myapp.git', branch: 'main'
            }
        }

        stage('Build') {
            steps {
                sh 'mvn clean package -DskipTests'
            }
        }

        stage('Test') {
            steps {
                sh 'mvn test'
            }
        }

        stage('SonarQube Analysis') {
            when {
                expression { params.RUN_SONAR }
            }
            steps {
                sh 'mvn sonar:sonar'
            }
        }

        stage('Upload Artifact to Nexus') {
            steps {
                sh '''
                mvn deploy -DskipTests \
                -DaltDeploymentRepository=nexus::default::http://3.110.219.178:8081/repository/maven-releases/
                '''
            }
        }

        stage('Docker Build') {
            steps {
                sh '''
                docker build -t myapp:latest .
                docker tag myapp:latest 3.110.219.178:8083/myapp:latest
                '''
            }
        }

        stage('Docker Push') {
            steps {
                sh '''
                docker push 3.110.219.178:8083/myapp:latest
                '''
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                sh 'kubectl apply -f k8s/'
            }
        }
    }

    post {
        success {
            echo "✅ Pipeline completed successfully"
        }
        failure {
            echo "❌ Pipeline failed"
        }
    }
}
