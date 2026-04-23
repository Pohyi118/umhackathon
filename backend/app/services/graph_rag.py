# -*- coding: utf-8 -*-
"""
PeopleGraph — GraphRAG & Manglish NLP Processor
=================================================
Ingests raw, unstructured data (WhatsApp logs, PDFs) to extract operational metrics.
Uses Malaya NLP for Manglish normalization and a Pinecone/Neo4j GraphRAG architecture
for hyper-localized SME context.
"""

import logging
from typing import Dict, List, Any

logger = logging.getLogger(__name__)

class ManglishNLPProcessor:
    """
    Normalizes Malaysian slang, "Manglish", and colloquial suffixes.
    E.g., "kompom" -> "confirm", "sangkut kat warehouse la" -> "delayed at warehouse".
    Uses rule-based + Levenshtein distance conceptually (mocked for demo).
    """
    
    def __init__(self):
        # In production, we'd import malaya
        # import malaya
        self.slang_dict = {
            "kompom": "confirm",
            "sangkut": "stuck/delayed",
            "kat": "at",
            "xde": "do not have",
            "tak": "not",
            "waybill": "tracking number"
        }
        self.suffixes_to_strip = ["la", "nya", "wei", "kot"]

    def normalize_text(self, raw_text: str) -> str:
        """Strips suffixes and translates known Manglish slang."""
        words = raw_text.lower().split()
        normalized = []
        
        for w in words:
            # Strip suffixes (naive implementation)
            for suffix in self.suffixes_to_strip:
                if w.endswith(suffix) and len(w) > len(suffix) + 2:
                    w = w[:-len(suffix)]
            
            # Translate slang
            if w in self.slang_dict:
                normalized.append(self.slang_dict[w])
            else:
                normalized.append(w)
                
        return " ".join(normalized)


class GraphRAGPipeline:
    """
    Connects to Pinecone (Vector) and Neo4j (Graph) for Retrieval-Augmented Generation.
    Provides context to the LLM so it doesn't hallucinate local concepts like "Kongsi Raya".
    """
    
    def __init__(self):
        self.nlp = ManglishNLPProcessor()
        # Mock connections
        self.pinecone_connected = True
        self.neo4j_connected = True

    def query_context(self, query: str) -> Dict[str, Any]:
        """
        Retrieves hybrid context (Semantic + Relationship mapping)
        """
        normalized_query = self.nlp.normalize_text(query)
        
        # Mock graph relationships from Neo4j
        graph_relationships = []
        if "delayed" in normalized_query or "stuck" in normalized_query:
            graph_relationships.append(
                "[Admin Clerk] -> (spends 70% time on) -> [Manual Data Entry] -> (causes) -> [4-Day Lag]"
            )
            
        # Mock vector search from Pinecone
        vector_matches = []
        if "raya" in normalized_query:
            vector_matches.append(
                "Kongsi Raya 2026 overlap requires 3x logistics scaling."
            )
            
        return {
            "query": query,
            "normalized_query": normalized_query,
            "neo4j_relationships": graph_relationships,
            "pinecone_semantic_context": vector_matches
        }

# Global instances
nlp_processor = ManglishNLPProcessor()
rag_pipeline = GraphRAGPipeline()
