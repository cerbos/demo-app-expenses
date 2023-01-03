connect:
	make connect-app & make connect-grafana & make connect-jaeger
connect-app:
	kubectl -n default port-forward svc/expenses 9000:8000
connect-grafana:
	kubectl -n monitoring port-forward svc/grafana 9001:80
connect-jaeger:
	kubectl -n monitoring port-forward svc/jaeger-query 9002:16686