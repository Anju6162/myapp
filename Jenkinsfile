pipeline {
    agent any

    tools {
        maven 'maven-3'
        jdk 'jdk17'
    }

    environment {
        // Nexus
        NEXUS_URL = 'http://3.110.219.178:8081'
        NEXUS_REPO = 'maven-releases'
        NEXUS_CREDS = 'nexus-creds3'

        // Docker
        DOCKER_IMAGE = 'anju6162/myapp'
        DOCKER_CREDS = 'dockerhub-creds'
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/Anju6162/myapp.git'
            }
        }

        stage('Build') {
            steps {
                sh '''
                  mvn clean package -DskipTests
                '''
            }
        }

        stage('Test') {
            steps {
                sh '''
                  mvn test || true
                '''
            }
        }

        stage('Upload Artifact to Nexus') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: "${NEXUS_CREDS}",
                        usernameVariable: 'NEXUS_USER',
                        passwordVariable: 'NEXUS_PASS'
                    )
                ]) {
                    sh '''
                      mvn deploy \
                      -DskipTests \
                      -Dnexus.url=${NEXUS_URL} \
                      -Dnexus.repo=${NEXUS_REPO} \
                      -Dnexus.username=$NEXUS_USER \
                      -Dnexus.password=$NEXUS_PASS
                    '''
                }
            }
        }

        stage('Docker Build') {
            steps {
                sh '''
                  docker build -t ${DOCKER_IMAGE}:${BUILD_NUMBER} .
                '''
            }
        }

        stage('Docker Login') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: "${DOCKER_CREDS}",
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )
                ]) {
                    sh '''
                      echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                    '''
                }
            }
        }

        stage('Docker Push') {
            steps {
                sh '''
                  docker tag ${DOCKER_IMAGE}:${BUILD_NUMBER} ${DOCKER_IMAGE}:latest
                  docker push ${DOCKER_IMAGE}:${BUILD_NUMBER}
                  docker push ${DOCKER_IMAGE}:latest
                '''
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                withCredentials([file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG')]) {
                    sh '''
                      kubectl apply -f k8s/
                      kubectl rollout status deployment myapp
                    '''
                }
            }
        }
    }

    post {
        success {
            echo '✅ CI/CD Pipeline completed successfully'
        }
        failure {
            echo '❌ CI/CD Pipeline failed'
        }
    }
}
