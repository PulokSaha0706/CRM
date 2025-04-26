import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CustomerTable = () => {
  const [customers, setCustomers] = useState([]);
  const [visibleCount, setVisibleCount] = useState(100); // For "Show More"
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [tagSearch, setTagSearch] = useState("");

  useEffect(() => {
    axios.get('http://localhost:5000/api/customers', {
      params: {
        search: searchTerm,
        tag: tagSearch,
      }
    })
      .then(response => {
        setCustomers(response.data);
        setVisibleCount(100); // Reset visible count on new search
      })
      .catch(error => {
        console.error('Error fetching customers:', error);
      });

    axios.get('http://localhost:5000/api/tags')
      .then(response => {
        setTags(response.data);
      })
      .catch(error => {
        console.error('Error fetching tags:', error);
      });
  }, [searchTerm, tagSearch]);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleTagSearch = (event) => {
    setTagSearch(event.target.value);
  };

  const handleTagChange = (customerId, tagName) => {
    setSelectedTags({
      ...selectedTags,
      [customerId]: tagName,
    });
  };

  const handleAddTag = (customerId) => {
    const tagName = selectedTags[customerId];
    const tagId = tags.find(tag => tag.name === tagName)?.id;

    if (tagId) {
      axios.post('http://localhost:5000/api/customer-tags', { customerId, tagId })
        .then(() => {
          alert('Tag added successfully!');
          axios.get('http://localhost:5000/api/customers')
            .then(response => {
              setCustomers(response.data);
            })
            .catch(error => {
              console.error('Error fetching customers:', error);
            });
        })
        .catch(error => {
          console.error('Error adding tag:', error);
        });
    } else {
      alert('Please select a valid tag');
    }
  };

  const handleShowMore = () => {
    setVisibleCount(prev => prev + 100);
  };

  const thStyle = {
    padding: '12px',
    textAlign: 'left',
    borderBottom: '2px solid #ddd'
  };

  const tdStyle = {
    padding: '12px',
    borderBottom: '1px solid #eee'
  };

  return (
    <div style={{
      maxWidth: '1000px',
      margin: '40px auto',
      padding: '20px',
      border: '1px solid #ccc',
      borderRadius: '12px',
      boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
      backgroundColor: '#fff'
    }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Customer Table</h2>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search by Name, Email, or Phone"
          value={searchTerm}
          onChange={handleSearch}
          style={{
            flex: 1,
            marginRight: '10px',
            padding: '10px',
            borderRadius: '6px',
            border: '1px solid #ccc'
          }}
        />
        <input
          type="text"
          placeholder="Search by Tag"
          value={tagSearch}
          onChange={handleTagSearch}
          style={{
            flex: 1,
            padding: '10px',
            borderRadius: '6px',
            border: '1px solid #ccc'
          }}
        />
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f0f0f0' }}>
            <th style={thStyle}>Name</th>
            <th style={thStyle}>Email</th>
            <th style={thStyle}>Phone</th>
            <th style={thStyle}>Company</th>
            <th style={thStyle}>Tags</th>
            <th style={thStyle}>Add Tag</th>
          </tr>
        </thead>
        <tbody>
          {customers.slice(0, visibleCount).map((customer) => (
            <tr key={customer.id}>
              <td style={tdStyle}>{customer.name}</td>
              <td style={tdStyle}>{customer.email}</td>
              <td style={tdStyle}>{customer.phone}</td>
              <td style={tdStyle}>{customer.company}</td>
              <td style={tdStyle}>
                {customer.tags && typeof customer.tags === 'string'
                  ? customer.tags.split(',').map(tag => (
                    <span key={tag} style={{
                      marginRight: '5px',
                      background: '#e0f0ff',
                      padding: '2px 6px',
                      borderRadius: '6px',
                      display: 'inline-block'
                    }}>
                      {tag}
                    </span>
                  ))
                  : <span style={{ color: '#aaa' }}>No Tags</span>}
              </td>
              <td style={tdStyle}>
                <select
                  value={selectedTags[customer.id] || ""}
                  onChange={(e) => handleTagChange(customer.id, e.target.value)}
                  style={{
                    marginRight: '10px',
                    padding: '5px',
                    borderRadius: '6px',
                    border: '1px solid #ccc'
                  }}
                >
                  <option value="">Select Tag</option>
                  {tags.map(tag => (
                    <option key={tag.id} value={tag.name}>{tag.name}</option>
                  ))}
                </select>
                <button
                  onClick={() => handleAddTag(customer.id)}
                  style={{
                    padding: '6px 10px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Add
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {visibleCount < customers.length && (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button
            onClick={handleShowMore}
            style={{
              padding: '10px 20px',
              backgroundColor: '#28a745',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Show More
          </button>
        </div>
      )}
    </div>
  );
};

export default CustomerTable;
