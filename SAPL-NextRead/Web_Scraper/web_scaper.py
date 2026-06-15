import json
import sys
import requests
from bs4 import BeautifulSoup


data = sys.argv[1:]


for title in data:
    url = f'https://mysapl.bibliocommons.com/v2/search?searchType=keyword&query=${title}&f_FORMAT=EBOOK%7CBK%7CGRAPHIC_NOVEL%7CLPRINT%7CAB'
    response = requests.get(url)
    page = BeautifulSoup(response.text, 'html.parser')
    results = page.find('ul', class_='results')
    if results != None:
        results = results.find_all('span', class_= 'title-content')
        results[0].get_text()
        print((title.replace('%20', " "),(any(element.get_text() == title.replace('%20', " ") for element in results))))
    else:
        print((title.replace('%20', " "),(False)))
sys.stdout.flush()
