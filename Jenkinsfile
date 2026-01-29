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
        DOCKER_REGISTRY = "<NEXUS_IP>:8083"
        APP_NAME = "myapp"
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
                sh 'mvn deploy -DskipTests'
            }
        }

        stage('Docker Build') {
            steps {
                sh """
                docker build -t ${APP_NAME}:latest .
                docker tag ${APP_NAME}:latest ${DOCKER_REGISTRY}/${APP_NAME}:latest
                """
            }
        }

        stage('Docker Push') {
            steps {
                sh 'docker push ${DOCKER_REGISTRY}/${APP_NAME}:latest'
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                sh 'kubectl apply -f k8s/'
            }
        }
    }
}
