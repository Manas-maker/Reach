import React, { useState } from "react";

const BusinessHoursSelector = ({ onChange }) => {
  const [businessHours, setBusinessHours] = useState({
    Monday: { open: "", close: "", isOpen: false },
    Tuesday: { open: "", close: "", isOpen: false },
    Wednesday: { open: "", close: "", isOpen: false },
    Thursday: { open: "", close: "", isOpen: false },
    Friday: { open: "", close: "", isOpen: false },
    Saturday: { open: "", close: "", isOpen: false },
    Sunday: { open: "", close: "", isOpen: false },
  });

  const handleCheckboxChange = (day) => {
    const updatedHours = {
      ...businessHours,
      [day]: { ...businessHours[day], isOpen: !businessHours[day].isOpen },
    };
    setBusinessHours(updatedHours);
    onChange(updatedHours);
  };

  const handleTimeChange = (day, field, value) => {
    const updatedHours = {
      ...businessHours,
      [day]: { ...businessHours[day], [field]: value },
    };
    setBusinessHours(updatedHours);
    onChange(updatedHours);
  };

  return (
    <div>
      <h3 className="margins">Set Business Hours:</h3>
      {Object.keys(businessHours).map((day) => (
        <div key={day} >
          <label id="hoursLabel">
            <input
              type="checkbox"
              checked={businessHours[day].isOpen}
              onChange={() => handleCheckboxChange(day)}
            />
            {day}
          </label>

          {businessHours[day].isOpen && (
            <>
              <select
                id="openTimings"
                value={businessHours[day].open}
                onChange={(e) => handleTimeChange(day, "open", e.target.value)}
              >
                <option value="">Opening Time</option>
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={`${i}:00`}>{`${i}:00`}</option>
                ))}
              </select>

              <select
                id="closeTimings"
                value={businessHours[day].close}
                onChange={(e) => handleTimeChange(day, "close", e.target.value)}
              >
                <option value="">Closing Time</option>
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={`${i}:00`}>{`${i}:00`}</option>
                ))}
              </select>
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default BusinessHoursSelector;
