# Create Continuous Integration and Continuous Deployment with GitHub Action , Digital Ocean, and Cloudflare - Project Documentation

This Topologi about my deployment on digitalocan 


![image](https://github.com/RiziqStankovic/be-tbsi-a/assets/86700754/50ba4bba-4695-4d19-9bde-a9976b2038e5)


Keterangan :
1. Cload Flare : DNS Register + DDOS Protection
2. Load balancer : Load balancer by DigitalOcean
3. Firewall : Limited acces of network traffic
4. Nginx ingress : load balancer of service. benefit : easy to management domain and can split domain internal and eksternal
5. Service frontend : Nginx (autoscaling), Alphine ( in my case just backend application) 
6. Service backend : Alphine
7. Cache server : Redis cluster to high availability cache server
8. Database : Mysql Cluster to high availability database
9. Storage : NFS by storage on application

## Accessing Backend Services

You can access the backend services as follows:

- Backend A: [https://be-tbsi-a.pharmaniaga.tech/](https://be-tbsi-a.pharmaniaga.tech/)
- Backend B: [https://be-tbsi-b.pharmaniaga.tech/](https://be-tbsi-b.pharmaniaga.tech/)

## Documentation of running service https

![Screenshot 2023-10-22 144302](https://github.com/RiziqStankovic/be-tbsi-a/assets/86700754/fdfb6c38-a32c-44bf-be27-52d2cc8572e9)


![Screenshot 2023-10-22 144323](https://github.com/RiziqStankovic/be-tbsi-a/assets/86700754/608a85bb-2712-4499-bb22-1aa50baf7bd3)



## CI/CD Workflow with GitHub Actions

![image](https://github.com/RiziqStankovic/be-tbsi-a/assets/86700754/84ce2040-ce51-4250-9284-c041f8ec32b2)


1. **Chekout code and Setup environment:** i choose build on runner server of github action and connect to my docker hub registry
2. **Pushing to Docker Hub:** after build Succes there are pushed to Docker Hub for as image.
3. **Push On kubernetes :** Connected on runner server and setup helm with values images latest then upgrade this chart with auth of kubernetes config as server.

## Doc Runner github action

![Screenshot 2023-10-22 144519](https://github.com/RiziqStankovic/be-tbsi-a/assets/86700754/2433879e-cb30-4041-9cd4-0aafb5d06e8f)


## Digital Ocean Integration

Facilitating secure and authorized deployments on Digital Ocean, I've streamlined the process by configuring essential credentials. This setup guarantees a smooth integration between GitHub and Digital Ocean, allowing for hassle-free deployments.

## Kubernetes Deployment Using Helm

Simplifying the deployment process on Kubernetes, I utilize Helm charts to manage configurations and dependencies effectively. Helm empowers us to maintain and scale our deployments efficiently, ensuring optimal performance.

## Ingress and Certificate Management

Within the Digital Ocean Kubernetes cluster, I've implemented Ingress controllers to efficiently route external traffic to backend services. To guarantee secure communication, Cert Manager automates the acquisition of SSL certificates, enhancing our system's overall security posture.

## Leveraging Cloudflare as a Content Delivery Network (CDN)

To boost both performance and security, I've seamlessly integrated Cloudflare as our Content Delivery Network (CDN). This integration not only accelerates content delivery by caching static assets but also bolsters our security measures with advanced features. The DNS records have been meticulously configured to direct traffic to the Ingress controller, ensuring a smooth and efficient integration with Cloudflare's robust infrastructure.

## Project Structure


```
- be-tbsi-a/
  - .github/workflows/
    - be-tbsi-a-test-cicd.yml
  - be-tbsi-a-chart/
    - templates/
      - Chart.yml
      - values.yml
  - test/
    - test_be-a.js/
  - .gitignore
  - backend-a.js
  - Dockerfile
  - package-lock.json
  - package.json
  - Readme.md
```
