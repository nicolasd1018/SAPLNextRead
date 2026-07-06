import sys
import requests
from bs4 import BeautifulSoup
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options




data = sys.argv[1]


# for title in data:
url = f'https://mysapl.bibliocommons.com/v2/search?searchType=keyword&query={data}&f_FORMAT=EBOOK%7CBK%7CGRAPHIC_NOVEL%7CLPRINT%7CAB'
session = requests.Session()
retry_strategy = Retry(
    total=5,  # Total number of retries
    backoff_factor=1,  # Waits 1 second between retries, then 2s, 4s, 8s...
    status_forcelist=[429, 500, 502, 503, 504],  # Status codes to retry on
    # method_whitelist=["HEAD", "GET", "OPTIONS"]  # Methods to retry
)

adapter = HTTPAdapter(max_retries=retry_strategy)
session.mount("http://", adapter)
session.mount("https://", adapter)

response: requests.Response
try:
    response = session.get(url)
    response.raise_for_status()  # Raise an exception for HTTP errors
except requests.exceptions.ConnectionError as e:
    print(f"Error connecting to the server: {e}")
except requests.exceptions.HTTPError as e:
    print(f"HTTP error occurred: {e}")
except requests.exceptions.RequestException as e:
    print(f"An error occurred: {e}")

# response = requests.get(url, {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
page = BeautifulSoup(response.text, 'html.parser')
results = page.find('ul', class_='results')
if results != None:
    results = results.find_all('span', class_= 'title-content')
    if (results[0].parent):
        new_url = 'https://mysapl.bibliocommons.com'+results[0].parent.attrs['href']

        chrome_options = Options()

        # Add the headless argument (the recommended format)
        chrome_options.add_argument("--headless=new") 

        # Optional optimization flags for headless stability
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--window-size=1920,1080")

        
        driver = webdriver.Chrome(chrome_options)
        driver.get(new_url)
        details_link = driver.find_element(By.CSS_SELECTOR, "[data-key='full-details-link']")
        details_link.click()

        age_rating = driver.find_element(By.CSS_SELECTOR, "[data-key='bib-details-full-screen-overlay']")

        details_popup = BeautifulSoup(age_rating.get_attribute("outerHTML"), 'html.parser')
        potential_age_info = details_popup.find_all('span', class_ = 'formatted-value')

        age_info = [element for element in potential_age_info if 'juvenile beginner' in element.text.lower() or 'juvenile fiction' in element.text.lower() or 'young adult' in element.text.lower()]

        if age_info != []:
            print(age_info[len(age_info)-1])
        else:
            print('Adult')

else:
    print('Error Retrieving Age')
sys.stdout.flush()
