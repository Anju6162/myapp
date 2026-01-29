pipeline {
    agent any

    tools {
        maven 'maven-3'
        jdk 'jdk17'
    }

    environment {
        NEXUS_URL   = 'http://3.110.219.178:8081'
        NEXUS_REPO  = 'maven-releases'
        NEXUS_CREDS = 'nexus-creds3'
        DOCKER_IMAGE = 'anjuli6162/myapp'
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
                  ls -l
                  cd myapp
                  mvn clean package -DskipTests
                '''
            }
        }

        stage('Test') {
            steps {
                sh '''
                  cd myapp
                  mvn test
                '''
            }
        }

        stage('Upload Artifact to Nexus') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: "${NEXUS_CREDS}",
                    usernameVariable: 'NEXUS_USER',
                    passwordVariable: 'NEXUS_PASS'
                )]) {
                    sh '''
                      cd myapp
                      mvn deploy \
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
                  cd myapp
                  docker build -t $DOCKER_IMAGE:latest .
                '''
            }
        }

        stage('Docker Push') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'docker-hub-creds',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh '''
                      echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin
                      docker push $DOCKER_IMAGE:latest
                    '''
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                withCredentials([file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG')]) {
                    sh '''
                      cd myapp
                      kubectl apply -f k8s/
                    '''
                }
            }
        }
    }

    post {
        success {
            echo '✅ CI/CD Pipeline Completed Successfully'
        }
        failure {
            echo '❌ CI/CD Pipeline Failed'
        }
    }
}
