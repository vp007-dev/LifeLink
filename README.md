![Poster](poster.png)


# LifeLink – City-Scale Emergency Response Infrastructure  
### Slingshot Round-2 System Design & Launch Plan  

🌐 Live Prototype: https://life-link-7qde.vercel.app/

---

## 🧠 Vision

LifeLink is a decentralized emergency response infrastructure designed to reduce medical emergency response time to **under 5 minutes** by mobilizing both government ambulances and verified community mobility networks (auto drivers, bikers, police patrols, and volunteers).

# 1. 🧩 System Architecture Diagram

```text
Citizen App
     |
     v
LifeLink Dispatch API
     |
     +-----------------------------+
     |                             |
     v                             v
Responder Network     Government Ambulance APIs
     |                             |
     v                             v
Hospital Network     Police / Health Department
     |
     v
Governance Analytics Dashboard
```

# 2. ⚙ Emergency Flow Diagram

```text
Emergency Trigger
        |
        v
Severity Classification Engine
        |
        v
Multi-Responder Broadcast
        |
        v
Fastest Responder Accepts
        |
        v
Hospital Pre-Alert
        |
        v
Live Rescue Tracking
        |
        v
Governance Logging
```

# 3. 📊 Data Flow Diagram

```text
User → Dispatcher → Responders → Hospital → Dashboard → Govt Logs
```


---

# 4. Growth & Failure Handling

| Scenario | LifeLink Protection |
|--------|--------------------|
| Heavy city traffic | Multi-node dispatch queue |
| No responder available | Auto reassignment |
| Internet failure | SMS / missed call distress |
| Sudden load spike | Horizontal micro-service scaling |
| Server crash | Fallback broadcast routing |
| Legal audit | Immutable rescue logs |

---
# 5. Core Round-2 Enhancements

### 🚀 Advanced System Enhancements
- Government ambulance API integration  
- Traffic-aware ETAs with live navigation  
- Offline distress beacon mode (SMS & missed call)  
- AI-based emergency prioritization & SLA routing  

### 🏅 Responder Incentive Framework
- Direct monetary compensation  
- Insurance & liability protection  
- Government-verified digital badges  
- Public recognition certificates  

### 📊 Governance Analytics Dashboard
- City-wise emergency density heatmaps  
- Responder performance metrics  
- Time-to-response & SLA compliance tracking  
- Immutable rescue audit timelines  

### 🤝 Stakeholder Integrations
- Police & Public Health departments  
- Hospitals & trauma centers  
- Emergency call centers  

---

## 💰 Responder Payment & Incentive Model

LifeLink introduces a **government-aligned, transparent incentive system** to motivate rapid and responsible emergency response.

### How Responders Are Paid

| Scenario | Compensation |
|---------|--------------|
| Patient successfully transported to hospital | ₹200 – ₹500 instant reward |
| High-risk emergencies (cardiac, trauma, accident) | ₹500 – ₹1000 bonus |
| Night-time / low-population zone rescues | Extra incentive |
| Volunteer responders | Reward points + digital certificates |

##  Payment Flow

```text
Rescue Completed → Hospital Confirms → LifeLink Credits Wallet → UPI / Bank Transfer Payout
```
Responders also receive **government-verified digital badges and certificates** for recognition.

---
## 🏛 Funding & Sustainability Model

LifeLink operates as a **public–private emergency infrastructure**.

### Who Funds LifeLink?

| Source | Purpose |
|------|--------|
| State Health Department | Ambulance API access & rescue subsidies |
| Smart City Mission | City-wide deployment |
| CSR Funds (Hospitals / Corporates) | Responder rewards & infrastructure |
| Insurance Companies | Accident response incentives |
| Municipal Corporations | Analytics dashboard & operations |

### Sustainability Logic

| Expense | Covered By |
|-------|-----------|
| Responder payments | CSR + Government grants |
| Server & infrastructure | Smart City Mission |
| Analytics dashboard | Municipal budgets |
| Expansion & maintenance | Public health funding |

## 🛡 Legal & Governance Compliance

LifeLink is aligned with:

- Indian Good Samaritan Law  
- National Health Mission  
- Digital India Infrastructure  
- Smart City Mission standards  

All rescue actions are **securely logged, auditable, and legally protected**.

---

# 6. Team Contributions

| Member | Role | Work |
|------|----|----|
| Vansh Pandey | Lead Coder | Ambulance API gateway, dispatch core, priority engine |
| Kartik Upadhyay | Coder | Responder routing, ETA engine, availability system |
| Yash Agarwal | UI/UX | Dashboards, live rescue tracking UI |
| Vishal Hotwani | Research | Governance compliance, incentive framework |

---


# 7. Impact

- Cuts emergency response time below **5 minutes**  
- Operates in rural & low-network zones  
- Smart City & Digital India compliant  
- Transparent governance-ready infrastructure  

---

# 8. Production Roadmap

| Phase | Expansion |
|-----|----------|
| City | Live dispatch + analytics |
| State | Inter-hospital coordination |
| National | Central health emergency grid |

---
# 📹 Video Overview
- 👉 https://youtu.be/mpJaJp4DS5U
---
