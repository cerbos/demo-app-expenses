
## Setup MiniKube (macos)
```
brew install chipmk/tap/docker-mac-net-connect
sudo brew services start chipmk/tap/docker-mac-net-connect
minikube start
minikube addons enable ingress
```

## Apply Charts
```
helmfile apply
```
