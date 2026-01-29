pipeline {
    agent any

    environment {
        NEXUS_REGISTRY = "3.110.219.178:8083"
        IMAGE_NAME     = "myapp"
        IMAGE_TAG      = "latest"
        FULL_IMAGE     = "${NEXUS_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build') {
            steps {
                sh '''
                  npm install
                '''
            }
        }

        stage('Docker Build') {
            steps {
                sh '''
                  docker build -t $FULL_IMAGE .
                '''
            }
        }

        stage('Upload Image to Nexus') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'nexus-creds3',
                    usernameVariable: 'NEXUS_USER',
                    passwordVariable: 'NEXUS_PASS'
                )]) {
                    sh '''
                      echo $NEXUS_PASS | docker login $NEXUS_REGISTRY -u $NEXUS_USER --password-stdin
                      docker push $FULL_IMAGE
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
            echo "✅ CI/CD Pipeline completed successfully"
        }
        failure {
            echo "❌ CI/CD Pipeline failed"
        }
    }
}
