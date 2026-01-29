pipeline {
    agent any

    parameters {
        booleanParam(
            name: 'RUN_SONAR',
            defaultValue: false,
            description: 'Run SonarQube Analysis (Optional)'
        )
    }

    environment {
        NEXUS_URL = "http://<NEXUS_IP>:8081"
        NEXUS_REPO = "maven-releases"
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
                echo "Running SonarQube Analysis"
                sh 'mvn sonar:sonar'
            }
        }

        stage('Upload Artifact to Nexus') {
            steps {
                echo "Uploading artifact to Nexus"
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
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-creds',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh """
                    echo \$DOCKER_PASS | docker login ${DOCKER_REGISTRY} -u \$DOCKER_USER --password-stdin
                    docker push ${DOCKER_REGISTRY}/${APP_NAME}:latest
                    """
                }
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
            echo "✅ CI/CD Pipeline Completed Successfully"
        }
        failure {
            echo "❌ Pipeline Failed"
        }
    }
}
