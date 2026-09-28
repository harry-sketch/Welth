import DateTimePicker, { useDefaultStyles } from "react-native-ui-datepicker";

interface Props {
  maxDate: Date;
  value: Date;
  onChange: (date: Date) => void;
}

export const CalendarPicker = ({ value, maxDate, onChange }: Props) => {
  const defStyles = useDefaultStyles("dark");

  return (
    <DateTimePicker
      date={value}
      mode="single"
      maxDate={maxDate}
      onChange={({ date }) =>
        date && onChange(new Date(date as string | Date | number))
      }
      styles={{
        ...defStyles,
        today: { borderWidth: 1, borderColor: "#fff" },
      }}
    />
  );
};
