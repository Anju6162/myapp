pipeline {
    agent any

    tools {
        maven 'maven-3'
        jdk 'jdk-17'
    }

    parameters {
        booleanParam(
            name: 'SKIP_SONAR',
            defaultValue: true,
            description: 'Skip SonarQube Analysis'
        )
    }

    environment {
        NEXUS_URL = "http://3.110.219.178:8081"
        NEXUS_REPO = "maven-releases"
        NEXUS_CREDENTIALS = "nexus-creds"

        DOCKER_IMAGE = "anju6162/myapp"
        DOCKER_TAG = "${BUILD_NUMBER}"

        KUBE_CONFIG = credentials('kubeconfig')
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build') {
            steps {
                dir('myapp') {
                    sh 'mvn clean package -DskipTests'
                }
            }
        }

        stage('Test') {
            steps {
                dir('myapp') {
                    sh 'mvn test'
                }
            }
        }

        stage('SonarQube Analysis') {
            when {
                expression { return !params.SKIP_SONAR }
            }
            steps {
                echo "Running SonarQube Analysis"
                // Add sonar command later if needed
            }
        }

        stage('Upload Artifact to Nexus') {
            steps {
                dir('myapp') {
                    withCredentials([usernamePassword(
                        credentialsId: "${NEXUS_CREDENTIALS}",
                        usernameVariable: 'NEXUS_USER',
                        passwordVariable: 'NEXUS_PASS'
                    )]) {
                        sh """
                        mvn deploy \
                        -DskipTests \
                        -DaltDeploymentRepository=nexus::default::${NEXUS_URL}/repository/${NEXUS_REPO}/ \
                        -Dnexus.username=$NEXUS_USER \
                        -Dnexus.password=$NEXUS_PASS
                        """
                    }
                }
            }
        }

        stage('Docker Build') {
            steps {
                dir('myapp') {
                    sh "docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} ."
                }
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
                    echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin
                    docker push ${DOCKER_IMAGE}:${DOCKER_TAG}
                    """
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                sh """
                kubectl apply -f k8s/deployment.yaml
                kubectl apply -f k8s/service.yaml
                """
            }
        }
    }

    post {
        success {
            echo "✅ CI/CD Pipeline completed successfully"
        }
        failure {
            echo "❌ CI/CD Pipeline failed"
        }
    }
}
