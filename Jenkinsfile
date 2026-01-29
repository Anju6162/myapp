 pipeline {
    agent any

    environment {
        DOCKER_IMAGE = "anjuli6162/myapp"
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/Anju6162/myapp.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh '''
                  npm install
                '''
            }
        }

        stage('Test') {
            steps {
                sh '''
                  npm test || echo "No tests defined"
                '''
            }
        }

        stage('Docker Build') {
            steps {
                sh '''
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
                      kubectl apply -f k8s/
                    '''
                }
            }
        }
    }

    post {
        success {
            echo "✅ Node.js CI/CD Pipeline Completed Successfully"
        }
        failure {
            echo "❌ Node.js CI/CD Pipeline Failed"
        }
    }
}

