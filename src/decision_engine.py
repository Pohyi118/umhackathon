import json
import ssl  # Built-in Python library for security
import os
from dotenv import load_dotenv
from neo4j import GraphDatabase

# --- 1. SECURE CONNECTION SETTINGS ---
# Load environment variables from the hidden .env file
load_dotenv() 

NEO4J_URI = os.getenv("NEO4J_URI")
# Fetch the password securely. 'neo4j' is usually the default username.
NEO4J_AUTH = ("neo4j", os.getenv("NEO4J_PASS")) 

class NadiPekerjaDSS:
    def __init__(self, uri, auth):
        # We create a "Security Context" that tells Python to ignore certificate errors
        context = ssl._create_unverified_context()
        
        # Connect using the manual SSL context
        self.driver = GraphDatabase.driver(
            uri, 
            auth=auth, 
            ssl_context=context
        )
        
    def close(self):
        self.driver.close()

    def get_statutory_rules(self, years_tenure):
        """Queries the Neo4j Graph for Akta Kerja 1955 notice periods."""
        if years_tenure < 2: bracket = "Under 2 years"
        elif 2 <= years_tenure <= 5: bracket = "2-5 years"
        else: bracket = "Over 5 years"

        query = """
        MATCH (r:Rule {tenure: $bracket})
        RETURN r.weeks AS notice_weeks
        """
        with self.driver.session() as session:
            result = session.run(query, bracket=bracket)
            record = result.single()
            return record["notice_weeks"] if record else 0

# --- 2. THE SIMULATION ENGINE ---
def run_restructuring_simulation(json_file_path):
    try:
        with open(json_file_path, 'r') as f:
            data = json.load(f)
    except FileNotFoundError:
        print(f"Error: Could not find '{json_file_path}'. Make sure it is in the same folder.")
        return

    dss_graph = NadiPekerjaDSS(NEO4J_URI, NEO4J_AUTH)
    
    print(f"\n{'Name':<12} | {'Role':<18} | {'Salary':<10} | {'Statutory Notice'}")
    print("-" * 75)

    # Testing for the first 10 employees
    for emp in data['workforce'][:10]:
        tenure = 3.0 # Simulation value
        notice_weeks = dss_graph.get_statutory_rules(tenure)
        
        weekly_rate = emp['monthly_salary_rm'] / 4.33
        buyout_cost = round(weekly_rate * notice_weeks, 2)
        
        print(f"{emp['first_name']:<12} | {emp['role']:<18} | RM {emp['monthly_salary_rm']:<8} | {notice_weeks} Weeks (Cost: RM {buyout_cost})")

    dss_graph.close()

if __name__ == "__main__":
    run_restructuring_simulation('nadi_pekerja_master_twin.json')
    