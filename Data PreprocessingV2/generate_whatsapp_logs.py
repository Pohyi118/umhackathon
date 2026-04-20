from google import genai

# 1. Authenticate using Vertex AI
# This automatically uses the credentials you just set up in the VS Code terminal!
client = genai.Client(
    vertexai=True,
    project="1024639033186", # Put your GCP Project ID here
    location="asia-southeast1" # Singapore region is best for Malaysia
)

# 2. The Prompt
prompt = """
You are generating a synthetic dataset of internal WhatsApp group chat logs for a Malaysian SME called "Chong Wholesale". 
You must strictly use "Manglish" (Malaysian English heavily mixed with casual Malay, Chinese slang, and local suffixes like 'lah', 'wei', 'kot', 'siot'). 

The Cast:
* Farhan (Warehouse): Constantly stressed, doing manual packing, always complaining about courier delays.
* Kak Yah (Admin): Spends all day manually typing J&T waybills. Slow and overwhelmed.
* Muthu (Sales): High energy, closing deals, constantly pushing the warehouse to ship faster.
* Boss Chong: Pops in occasionally to ask for updates.

The Scenario:
It is the week before the "Kongsi Raya" overlap. Sales are through the roof. The warehouse is heavily bottlenecked because Kak Yah is manually typing tracking numbers. 

Output Format:
Generate 50 rows of chronological chat logs spanning a single busy workday (9:00 AM to 9:00 PM). 
Use exactly this format with a pipe delimiter:
Timestamp|Sender|Message

Example:
2026-02-10 14:02:00|Farhan|Boss, waybill J&T sangkut lagi kat warehouse. Nak mampus packing ni.

Output ONLY the raw data with the header row. No markdown formatting, no code blocks, no extra text.
"""

print("Generating Manglish dataset via Vertex AI... please wait.")

# 3. Call the API using Vertex AI
try:
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=prompt
    )
    raw_text = response.text.strip()
    
    # 4. Save to CSV
    with open("whatsapp_logs.csv", "w", encoding="utf-8") as file:
        file.write(raw_text)
        
    print("Success! Data saved to whatsapp_logs.csv 🚀")

except Exception as e:
    print(f"An error occurred: {e}")