<%@page import="org.json.JSONObject"%><%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<%@page import="java.io.PrintWriter"%>
<%@page import="java.util.*" %>
<%@page import="bmlclf.DataUnit" %>
<%@page import="bmlclfimpl.DataUnitClf" %>
<%@page import="dalclf.AppFactoryClf" %>
<%@page import="bmlclf.DataModel" %>
<%@page import="dalclf.SqlClf" %>
<%@page import="dalclf.Conn" %>
<%
	PrintWriter writer = response.getWriter();
	//Map<String,Object> usr = (Map<String, Object>) session.getAttribute("usrs");
	try {
		String accNo = request.getParameter("accNo");
		String clazz = request.getParameter("clazz");
		String name = request.getParameter("mname");
		String whereStr = request.getParameter("whereStr");
		System.out.println(request.getParameter("opType"));
		int opType = Integer.valueOf(request.getParameter("opType"));
		//Long menu_id = Long.valueOf(request.getParameter("menu_id"));
		String parmStr = request.getParameter("parmMap");
		Map<String,Object> map = null;
		if(parmStr != "" && parmStr != null){
			JSONObject json = new JSONObject(parmStr);
			map = new HashMap<String,Object>();
			Iterator it = json.keys();
			String key;
			while(it.hasNext()){
				key = it.next()+"";
				map.put(key,json.isNull(key) ? null : json.get(key));
			}
		}
		//String str = AppFactoryClf.getInstance().gateModel2Json(Long.valueOf(usr.get("USRS_ID").toString()), menu_id, accNo, name,opType,whereStr,map);
		String str = AppFactoryClf.instanceDataModel2Json(accNo,name,opType,whereStr,map,true);
		writer.write(str);
	}catch(Exception e){
		e.printStackTrace();
		writer.write(e.getMessage());
	}finally{
		writer.close();
	}
	
	/*
	String sql = "UPDATE YYIIWEB.GRAPH a SET ver_no=" +
				"(select max(ver_no)+1 from yyiiweb.graph b " +
					"where b.fact_id=:fact_id and b.code_no=:code_no " +
					"and b.pe_id=:pe_id) " +
			"where a.fact_id=:fact_id " +
				"and a.code_no=:code_no and a.pe_id=:pe_id and a.ver_no=0";
	Map<String,Object> parm = new HashMap<String, Object>();
	parm.put("fact_id", 215);
	parm.put("code_no", "ASC");
	parm.put("pe_id", 1);
	SqlClf runsql = new SqlClf();
	runsql.setOriFix(sql);
	runsql.setParms(parm); //按参数名给参数值
	
	List<Object> vals = new ArrayList<Object>();
	Conn con = AppFactoryClf.getInstanceConnection("WEBDEV");
	String newsql = runsql.jdbcSql(con,vals); //转换成JDBC实际要执行的SQL
	con.close();
	System.out.println(newsql);
	*/
	//int rtn = con.prepareStatement(newsql,vals).executeUpdate();

%>