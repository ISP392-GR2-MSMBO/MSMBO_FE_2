import React, { useState } from "react"
import "../css/CustomerSupport.css"
const initialcustomers = [
    { id: 1, customer: "John Doe", subject: "Issue with ticket", date: "Sep 10", status: "open", email: "john.doe@example.com", phone: "+1 234 567 890", details: "Chi tiết lỗi vé..." },
    { id: 2, customer: "Jane Smith", subject: "Payment failure", date: "Sep 9", status: "open", email: "jane.smith@example.com", phone: "+1 234 567 891", details: "Không thanh toán được..." },
    { id: 3, customer: "Alex Brown", subject: "Technical problem", date: "Sep 8", status: "open", email: "alex.brown@example.com", phone: "+1 234 567 892", details: "Lỗi kỹ thuật..." },
]

const CustomerSupport = () => {
    const [customers] = useState(initialcustomers)
    const [selectedId, setSelectedId] = useState(customers[0].id)
    const [search, setSearch] = useState("")
    const [response, setResponse] = useState("")

    const selectedCustomer = customers.find((c) => c.id === selectedId)
    const filterCustomer = customers.filter((c) => c.customer.toLowerCase().includes(search.toLowerCase()) ||
        c.subject.toLowerCase().includes(search.toLowerCase()))

    return (<div className="customer-container">
        <div className="customer-list">
            <h2>Danh sách khách hàng</h2>
            <input
                type="search"
                placeholder="Tìm..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="customer-search-input"
            />
            <table className="customer-table">
                <thead>
                    <tr>
                        <th>#ID</th>
                        <th>Khách hàng</th>
                        <th>Chủ đề</th>
                        <th>Ngày</th>
                    </tr>
                </thead>
                <tbody>
                   {filterCustomer.map(c => (
                    <tr
                        key={c.id}
                        className={selectedId === c.id ? "selected" : ""}
                        onClick={() => setSelectedId(c.id)}
                    >
                        <td>{String(c.id).padStart(2, "0")}</td>
                        <td>{c.customer}</td>
                        <td>{c.subject}</td>
                        <td>{c.date}</td>
                    </tr>
                   ))} 
                </tbody>
            </table>
        </div>
        <div className="customer-detail">
            {selectedId && (
               <>
            <div className="cs-customer">
              <b>{selectedCustomer.customer}</b><br />
              {selectedCustomer.email}<br />
              {selectedCustomer.phone}
            </div>
            <div className="cs-issue">
              <b>Issue details</b>
              <textarea value={selectedCustomer.details} readOnly />
            </div>
            <div className="cs-response">
              <b>Response</b>
              <textarea
                value={response}
                onChange={e => setResponse(e.target.value)}
                placeholder="Type your response..."
              />
              <div className="cs-actions">
                <button>Send Reply</button>
                <button>Mark as Done</button>
                <button>Transfer</button>
              </div>
            </div>
          </>
            )}
        </div>
    </div>)

}
export default CustomerSupport