#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for King Julien's World Cuisine Tour
Tests all API endpoints with proper validation and error handling
"""

import requests
import json
import sys
import uuid
from datetime import datetime

# Base URL from environment - using local URL for testing
BASE_URL = "http://localhost:3000/api"

class APITester:
    def __init__(self):
        self.base_url = BASE_URL
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        })
        self.test_results = []
        
    def log_test(self, test_name, success, message, response_data=None):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {message}")
        
        self.test_results.append({
            'test': test_name,
            'success': success,
            'message': message,
            'response_data': response_data
        })
        
        if response_data and not success:
            print(f"   Response: {json.dumps(response_data, indent=2)}")
    
    def test_api_root(self):
        """Test GET / - API root endpoint"""
        try:
            response = self.session.get(f"{self.base_url}/")
            
            if response.status_code == 200:
                data = response.json()
                if "King Julien" in data.get('message', ''):
                    self.log_test("API Root", True, "API root endpoint working correctly", data)
                    return True
                else:
                    self.log_test("API Root", False, "Unexpected response message", data)
                    return False
            else:
                self.log_test("API Root", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("API Root", False, f"Exception: {str(e)}")
            return False
    
    def test_countries_aggregate(self):
        """Test GET /api/aggregate - Countries with visit counts"""
        try:
            response = self.session.get(f"{self.base_url}/aggregate")
            
            if response.status_code == 200:
                data = response.json()
                
                if isinstance(data, list):
                    if len(data) > 0:
                        # Check structure of first country
                        country = data[0]
                        required_fields = ['country_code', 'name', 'visit_count', 'color_intensity']
                        
                        if all(field in country for field in required_fields):
                            self.log_test("Countries Aggregate", True, 
                                        f"Retrieved {len(data)} countries with correct structure", 
                                        {"sample": country, "total_count": len(data)})
                            return True
                        else:
                            missing = [f for f in required_fields if f not in country]
                            self.log_test("Countries Aggregate", False, 
                                        f"Missing required fields: {missing}", country)
                            return False
                    else:
                        self.log_test("Countries Aggregate", True, "Empty countries list (valid response)", data)
                        return True
                else:
                    self.log_test("Countries Aggregate", False, "Response is not a list", data)
                    return False
            else:
                self.log_test("Countries Aggregate", False, 
                            f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Countries Aggregate", False, f"Exception: {str(e)}")
            return False
    
    def test_countries_list(self):
        """Test GET /api/countries - All countries for dropdowns"""
        try:
            response = self.session.get(f"{self.base_url}/countries")
            
            if response.status_code == 200:
                data = response.json()
                
                if isinstance(data, list):
                    if len(data) > 0:
                        # Check structure of first country
                        country = data[0]
                        required_fields = ['id', 'name', 'country_code']
                        
                        if all(field in country for field in required_fields):
                            self.log_test("Countries List", True, 
                                        f"Retrieved {len(data)} countries for dropdowns", 
                                        {"sample": country, "total_count": len(data)})
                            return True, data
                        else:
                            missing = [f for f in required_fields if f not in country]
                            self.log_test("Countries List", False, 
                                        f"Missing required fields: {missing}", country)
                            return False, None
                    else:
                        self.log_test("Countries List", True, "Empty countries list (valid response)", data)
                        return True, data
                else:
                    self.log_test("Countries List", False, "Response is not a list", data)
                    return False, None
            else:
                self.log_test("Countries List", False, 
                            f"HTTP {response.status_code}: {response.text}")
                return False, None
                
        except Exception as e:
            self.log_test("Countries List", False, f"Exception: {str(e)}")
            return False, None
    
    def test_country_details(self, country_code="US"):
        """Test GET /api/country?code=XX - Country details with restaurants"""
        try:
            response = self.session.get(f"{self.base_url}/country?code={country_code}")
            
            if response.status_code == 200:
                data = response.json()
                
                # Check required structure
                if 'country' in data and 'visits' in data:
                    country = data['country']
                    visits = data['visits']
                    
                    # Validate country structure
                    if 'id' in country and 'name' in country and 'country_code' in country:
                        self.log_test("Country Details", True, 
                                    f"Retrieved details for {country['name']} with {len(visits)} visits", 
                                    {"country": country['name'], "visits_count": len(visits)})
                        return True
                    else:
                        self.log_test("Country Details", False, 
                                    "Country object missing required fields", data)
                        return False
                else:
                    self.log_test("Country Details", False, 
                                "Response missing 'country' or 'visits' fields", data)
                    return False
            else:
                self.log_test("Country Details", False, 
                            f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Country Details", False, f"Exception: {str(e)}")
            return False
    
    def test_country_details_invalid(self):
        """Test GET /api/country without code parameter"""
        try:
            response = self.session.get(f"{self.base_url}/country")
            
            if response.status_code == 400:
                data = response.json()
                if 'error' in data and 'required' in data['error'].lower():
                    self.log_test("Country Details (Invalid)", True, 
                                "Correctly rejected request without country code", data)
                    return True
                else:
                    self.log_test("Country Details (Invalid)", False, 
                                "Error message doesn't mention required parameter", data)
                    return False
            else:
                self.log_test("Country Details (Invalid)", False, 
                            f"Expected 400 but got HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Country Details (Invalid)", False, f"Exception: {str(e)}")
            return False
    
    def test_add_visit_valid(self, countries_data=None):
        """Test POST /api/visit - Add restaurant visit"""
        try:
            # Use first country from countries list if available
            if countries_data and len(countries_data) > 0:
                country_id = countries_data[0]['id']
                country_name = countries_data[0]['name']
            else:
                # Fallback to a UUID (might fail if country doesn't exist)
                country_id = str(uuid.uuid4())
                country_name = "Test Country"
            
            visit_data = {
                "country_id": country_id,
                "restaurant_name": "Royal Lemur Bistro",
                "location": "Downtown Madagascar",
                "items_devoured": "Baobab fruit salad, Lemur leaf wraps, Royal mango smoothie",
                "king_julien_favorite": "Baobab fruit salad - absolutely divine!",
                "mort_favorite": "Royal mango smoothie - so sweet and refreshing!",
                "is_fusion": False,
                "fusion_country_id": None
            }
            
            response = self.session.post(f"{self.base_url}/visit", 
                                       data=json.dumps(visit_data))
            
            if response.status_code == 200:
                data = response.json()
                
                # Check if response contains the visit data
                if 'id' in data and 'restaurant_name' in data:
                    self.log_test("Add Visit (Valid)", True, 
                                f"Successfully added visit to {visit_data['restaurant_name']}", 
                                {"visit_id": data.get('id'), "restaurant": data.get('restaurant_name')})
                    return True, data
                else:
                    self.log_test("Add Visit (Valid)", False, 
                                "Response missing expected fields", data)
                    return False, None
            else:
                self.log_test("Add Visit (Valid)", False, 
                            f"HTTP {response.status_code}: {response.text}")
                return False, None
                
        except Exception as e:
            self.log_test("Add Visit (Valid)", False, f"Exception: {str(e)}")
            return False, None
    
    def test_add_visit_fusion(self, countries_data=None):
        """Test POST /api/visit - Add fusion restaurant visit"""
        try:
            # Use first two countries from countries list if available
            if countries_data and len(countries_data) >= 2:
                country_id = countries_data[0]['id']
                fusion_country_id = countries_data[1]['id']
                country_name = countries_data[0]['name']
                fusion_country_name = countries_data[1]['name']
            else:
                # Fallback to UUIDs (might fail if countries don't exist)
                country_id = str(uuid.uuid4())
                fusion_country_id = str(uuid.uuid4())
                country_name = "Test Country 1"
                fusion_country_name = "Test Country 2"
            
            visit_data = {
                "country_id": country_id,
                "restaurant_name": "Fusion Palace of Flavors",
                "location": "International District",
                "items_devoured": f"Fusion delights combining {country_name} and {fusion_country_name} cuisines",
                "king_julien_favorite": "The royal fusion platter - magnificent!",
                "mort_favorite": "Sweet fusion dessert - absolutely delightful!",
                "is_fusion": True,
                "fusion_country_id": fusion_country_id
            }
            
            response = self.session.post(f"{self.base_url}/visit", 
                                       data=json.dumps(visit_data))
            
            if response.status_code == 200:
                data = response.json()
                
                # Check if response contains the visit data with fusion info
                if 'id' in data and 'is_fusion' in data and data['is_fusion']:
                    self.log_test("Add Visit (Fusion)", True, 
                                f"Successfully added fusion visit to {visit_data['restaurant_name']}", 
                                {"visit_id": data.get('id'), "is_fusion": data.get('is_fusion')})
                    return True
                else:
                    self.log_test("Add Visit (Fusion)", False, 
                                "Response missing fusion fields or fusion not set", data)
                    return False
            else:
                self.log_test("Add Visit (Fusion)", False, 
                            f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Add Visit (Fusion)", False, f"Exception: {str(e)}")
            return False
    
    def test_add_visit_invalid(self):
        """Test POST /api/visit - Invalid data (missing required fields)"""
        try:
            # Missing required fields
            invalid_data = {
                "restaurant_name": "Incomplete Restaurant",
                # Missing country_id, location, items_devoured
            }
            
            response = self.session.post(f"{self.base_url}/visit", 
                                       data=json.dumps(invalid_data))
            
            if response.status_code == 400:
                data = response.json()
                if 'error' in data and 'required' in data['error'].lower():
                    self.log_test("Add Visit (Invalid)", True, 
                                "Correctly rejected request with missing required fields", data)
                    return True
                else:
                    self.log_test("Add Visit (Invalid)", False, 
                                "Error message doesn't mention required fields", data)
                    return False
            else:
                self.log_test("Add Visit (Invalid)", False, 
                            f"Expected 400 but got HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Add Visit (Invalid)", False, f"Exception: {str(e)}")
            return False
    
    def test_invalid_route(self):
        """Test invalid route - should return 404"""
        try:
            response = self.session.get(f"{self.base_url}/nonexistent")
            
            if response.status_code == 404:
                data = response.json()
                if 'error' in data:
                    self.log_test("Invalid Route", True, 
                                "Correctly returned 404 for invalid route", data)
                    return True
                else:
                    self.log_test("Invalid Route", False, 
                                "404 response missing error field", data)
                    return False
            else:
                self.log_test("Invalid Route", False, 
                            f"Expected 404 but got HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Invalid Route", False, f"Exception: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all API tests in sequence"""
        print(f"🚀 Starting comprehensive API testing for King Julien's World Cuisine Tour")
        print(f"📍 Base URL: {self.base_url}")
        print("=" * 80)
        
        # Test 1: API Root
        self.test_api_root()
        
        # Test 2: Countries Aggregate (HIGH PRIORITY)
        self.test_countries_aggregate()
        
        # Test 3: Countries List (MEDIUM PRIORITY) - needed for other tests
        countries_success, countries_data = self.test_countries_list()
        
        # Test 4: Country Details (HIGH PRIORITY)
        if countries_data and len(countries_data) > 0:
            # Use first country's code for testing
            test_country_code = countries_data[0]['country_code']
            self.test_country_details(test_country_code)
        else:
            # Fallback to common country code
            self.test_country_details("US")
        
        # Test 5: Country Details Invalid
        self.test_country_details_invalid()
        
        # Test 6: Add Visit Valid (HIGH PRIORITY)
        visit_success, visit_data = self.test_add_visit_valid(countries_data)
        
        # Test 7: Add Visit Fusion (HIGH PRIORITY)
        self.test_add_visit_fusion(countries_data)
        
        # Test 8: Add Visit Invalid
        self.test_add_visit_invalid()
        
        # Test 9: Invalid Route
        self.test_invalid_route()
        
        # Summary
        print("=" * 80)
        self.print_summary()
        
        return self.test_results
    
    def print_summary(self):
        """Print test summary"""
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result['success'])
        failed_tests = total_tests - passed_tests
        
        print(f"📊 TEST SUMMARY")
        print(f"   Total Tests: {total_tests}")
        print(f"   ✅ Passed: {passed_tests}")
        print(f"   ❌ Failed: {failed_tests}")
        print(f"   Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if failed_tests > 0:
            print(f"\n🔍 FAILED TESTS:")
            for result in self.test_results:
                if not result['success']:
                    print(f"   • {result['test']}: {result['message']}")
        
        print("=" * 80)

def main():
    """Main test execution"""
    tester = APITester()
    results = tester.run_all_tests()
    
    # Exit with error code if any tests failed
    failed_count = sum(1 for result in results if not result['success'])
    sys.exit(failed_count)

if __name__ == "__main__":
    main()