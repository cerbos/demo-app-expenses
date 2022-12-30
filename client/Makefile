release:
	docker buildx build --build-arg VITE_API_HOST=/api --push --platform linux/arm64/v8,linux/amd64 --tag ghcr.io/cerbos/demo-app-expenses-client:latest -f Dockerfile.prod .