
```
brew install chipmk/tap/docker-mac-net-connect
sudo brew services start chipmk/tap/docker-mac-net-connect
minikube start
minikube addons enable ingress
kubectl apply -f jaeger.yml
kubectl apply -f prometheus.yml
kubectl apply -f grafana.yml
kubectl apply -f cerbos.yml
kubectl apply -f app.yml
```