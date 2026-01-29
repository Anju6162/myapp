pipeline {
  agent any

  environment {
    IMAGE = "anju6162/myapp:latest"
    DOCKER_CREDS = credentials('dockerhub-creds')
  }

  stages {

    stage('Build Docker Image') {
      steps {
        sh 'docker build -t $IMAGE .'
      }
    }

    stage('Login to Docker Hub') {
      steps {
        sh '''
          echo "$DOCKER_CREDS_PSW" | docker login -u "$DOCKER_CREDS_USR" --password-stdin
        '''
      }
    }

    stage('Push Image to Docker Hub') {
      steps {
        sh 'docker push $IMAGE'
      }
    }

    stage('Deploy to Kubernetes') {
      steps {
        sh '''
          kubectl apply -f k8s/deployment.yaml
          kubectl apply -f k8s/service.yaml
        '''
      }
    }
  }
}
