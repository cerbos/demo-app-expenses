connect-app:
	kubectl -n default port-forward svc/expenses 9000:8000
connect-grafana:
	kubectl -n monitoring port-forward svc/grafana 9001:80
connect-jaeger:
	kubectl -n monitoring port-forward svc/jaeger-query 9002:16686
connect-prom:
	kubectl -n monitoring port-forward svc/prometheus-server 9003:80
connect-argo:
	kubectl -n argo port-forward svc/argo-argo-workflows-server 9004:2746