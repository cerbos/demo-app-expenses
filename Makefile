release:
	docker buildx build --push --platform linux/arm64/v8,linux/amd64 --tag ghcr.io/cerbos/demo-app-expenses:latest -f Dockerfile .