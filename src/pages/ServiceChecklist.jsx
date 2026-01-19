import { useEffect, useState } from "react";
import api from "../utils/api";

const ServiceChecklist = ({ brandId, editable }) => {
  const [services, setServices] = useState([]);

  useEffect(() => {
    api.get(`/api/admin/services/${brandId}`)
      .then(res => setServices(res.data.services))
      .catch(console.error);
  }, [brandId]);

  const toggleService = async (name, completed) => {
    await api.patch(`/api/admin/services/${brandId}`, {
      serviceName: name,
      completed
    });

    setServices(prev =>
      prev.map(s =>
        s.name === name ? { ...s, completed } : s
      )
    );
  };

  return (
    <div className="border rounded-lg p-4">
      <h3 className="font-semibold mb-4">Services Checklist</h3>

      {services.map(service => (
        <label
          key={service.name}
          className="flex items-center mb-2 cursor-pointer"
        >
          <input
            type="checkbox"
            checked={service.completed}
            disabled={!editable}
            onChange={e =>
              toggleService(service.name, e.target.checked)
            }
            className="mr-2"
          />
          <span>{service.name}</span>
        </label>
      ))}
    </div>
  );
};

export default ServiceChecklist;
