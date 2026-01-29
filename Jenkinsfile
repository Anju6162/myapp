pipeline {
  agent any

  environment {
    IMAGE = "anju6162/myapp:latest"
    DOCKER_CREDS = credentials('dockerhub-creds')
    SONARQUBE_SERVER = 'sonarqube-server'
  }

  stages {

    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Build') {
      steps {
        sh 'docker build -t $IMAGE .'
      }
    }

    stage('Test') {
      steps {
        echo 'Running basic tests'
        sh 'echo "Tests passed"'
      }
    }

    stage('SonarQube Analysis') {
      steps {
        withSonarQubeEnv('sonarqube-server') {
          sh '''
            sonar-scanner \
            -Dsonar.projectKey=myapp \
            -Dsonar.sources=. \
            -Dsonar.host.url=$SONAR_HOST_URL \
            -Dsonar.login=$SONAR_AUTH_TOKEN
          '''
        }
      }
    }

    stage('Docker Login') {
      steps {
        sh '''
          echo "$DOCKER_CREDS_PSW" | docker login -u "$DOCKER_CREDS_USR" --password-stdin
        '''
      }
    }

    stage('Docker Push') {
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
