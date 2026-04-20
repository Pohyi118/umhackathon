from neo4j import GraphDatabase

# Replace with your actual AuraDB credentials
URI = "neo4j+s://3191d327.databases.neo4j.io"
AUTH = ("neo4j", "wRVIJx1dvvWq6cjZjHXbQB4hAWfOHB9JASLqhjQXBNE")

class NadiPekerjaGraph:
    def __init__(self):
        self.driver = GraphDatabase.driver(URI, auth=AUTH)

    def close(self):
        self.driver.close()

    def get_legal_warning(self, tenure_years, salary):
        """Asks the graph for legal constraints before Boss Chong makes a move."""
        
        # Determine tenure bracket for query
        if tenure_years < 2: bracket = "Under 2 years"
        elif 2 <= tenure_years <= 5: bracket = "2-5 years"
        else: bracket = "Over 5 years"

        query = """
        MATCH (r:Rule {tenure: $bracket})
        RETURN r.weeks AS notice_weeks, r.days_per_year AS severance_days
        """

        with self.driver.session() as session:
            result = session.run(query, bracket=bracket)
            record = result.single()
            
            # Calculate estimated severance (simplistic version)
            daily_rate = salary / 26
            est_severance = record['severance_days'] * daily_rate * tenure_years

            return {
                "notice_required": record['notice_weeks'],
                "est_severance_cost": round(est_severance, 2)
            }

# --- TEST THE ENGINE ---
graph = NadiPekerjaGraph()
legal_info = graph.get_legal_warning(tenure_years=3, salary=4500)

print(f"⚠️ STATUTORY ALERT (AKTA KERJA 1955):")
print(f"- Required Notice: {legal_info['notice_required']} weeks")
print(f"- Estimated Severance Cost: RM {legal_info['est_severance_cost']}")

graph.close()